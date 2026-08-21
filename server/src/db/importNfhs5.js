const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { getPool, query, closePool } = require('../config/db');
const { getEnv } = require('../config/env');
require('dotenv').config();

const DEFAULT_WORKBOOK = path.resolve(__dirname, '../../../client/public/data/NFHS_5_India_Districts_Factsheet_Data.xlsx');
const SOURCE_NAME = 'NFHS-5 India District Factsheet';
const REPORTING_PERIOD = '2019-21';
const DATA_YEAR = 2021;
const EXPECTED_DISTRICTS = 36;

const DISTRICT_ALIASES = {
  ahmednagar: 'ahilyanagar',
  ahmadnagar: 'ahilyanagar',
  ahilyanagar: 'ahilyanagar',
  aurangabad: 'chhatrapati sambhajinagar',
  'chhatrapati sambhajinagar': 'chhatrapati sambhajinagar',
  bid: 'beed',
  beed: 'beed',
  buldana: 'buldhana',
  buldhana: 'buldhana',
  gondiya: 'gondia',
  gondia: 'gondia',
  osmanabad: 'dharashiv',
  dharashiv: 'dharashiv',
  raigarh: 'raigad',
  raigad: 'raigad',
  mumbai: 'mumbai city',
  'mumbai city': 'mumbai city',
};

const INDICATORS = [
  {
    name: 'stunting',
    unit: '%',
    match: (header) => /children under 5 years who are stunted/i.test(header),
  },
  {
    name: 'wasting',
    unit: '%',
    match: (header) => /children under 5 years who are wasted/i.test(header) && !/severely wasted/i.test(header),
  },
  {
    name: 'severe wasting',
    unit: '%',
    match: (header) => /children under 5 years who are severely wasted/i.test(header),
  },
  {
    name: 'underweight',
    unit: '%',
    match: (header) => /children under 5 years who are underweight/i.test(header),
  },
  {
    name: 'overweight',
    unit: '%',
    match: (header) => /children under 5 years who are overweight/i.test(header),
  },
  {
    name: 'iodized salt usage',
    unit: '%',
    match: (header) => /households using iodized salt/i.test(header),
  },
  {
    name: 'vitamin A dose coverage',
    unit: '%',
    match: (header) => /children age 9-35 months who received a vitamin a dose/i.test(header),
  },
];

function normalizeDistrictName(value) {
  const normalized = String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase()
    .replace(/\s+/g, ' ');

  return DISTRICT_ALIASES[normalized] || normalized;
}

function normalizeState(value) {
  return String(value || '').trim().toLocaleLowerCase() === 'maharastra'
    ? 'Maharashtra'
    : String(value || '').trim();
}

function parsePercentage(value) {
  if (value === null || value === undefined || value === '' || value === '*') return null;
  const parsed = Number(String(value).replace(/%/g, '').trim());
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 100 ? parsed : null;
}

function findColumn(headers, indicator) {
  const index = headers.findIndex((header) => indicator.match(String(header || '')));
  if (index === -1) {
    throw new Error(`NFHS column not found for indicator: ${indicator.name}`);
  }
  return index;
}

function readWorkbook(workbookPath) {
  if (!fs.existsSync(workbookPath)) {
    throw new Error(`NFHS workbook not found: ${workbookPath}`);
  }

  const workbook = XLSX.readFile(workbookPath, { cellDates: true });
  const sheet = workbook.Sheets.Sheet1;
  if (!sheet) throw new Error('NFHS workbook is missing Sheet1.');

  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
  const headers = rows[0] || [];
  const districtColumn = headers.indexOf('District Names');
  const stateColumn = headers.indexOf('State/UT');
  if (districtColumn === -1 || stateColumn === -1) {
    throw new Error('NFHS workbook is missing District Names or State/UT columns.');
  }

  const indicatorColumns = INDICATORS.map((indicator) => ({
    ...indicator,
    column: findColumn(headers, indicator),
  }));

  const rowsByDistrict = new Map();
  for (const row of rows.slice(1)) {
    if (normalizeState(row[stateColumn]) !== 'Maharashtra') continue;
    const district = normalizeDistrictName(row[districtColumn]);
    if (district) rowsByDistrict.set(district, { row, district });
  }

  if (rowsByDistrict.size !== EXPECTED_DISTRICTS) {
    throw new Error(`Expected ${EXPECTED_DISTRICTS} Maharashtra NFHS rows, found ${rowsByDistrict.size}.`);
  }

  return { rowsByDistrict, indicatorColumns };
}

async function importNfhs5(workbookPath = DEFAULT_WORKBOOK) {
  const { rowsByDistrict, indicatorColumns } = readWorkbook(workbookPath);
  if (!getEnv('DATABASE_URL')) {
    throw new Error('DATABASE_URL is required to import NFHS-5 data.');
  }
  const { rows: districtRows } = await query("SELECT id, name, slug, state FROM districts WHERE lower(state) = 'maharashtra'");
  const districtsByName = new Map(districtRows.map((district) => [normalizeDistrictName(district.name), district]));
  const missingSource = [];
  const missingDatabase = [];

  for (const district of districtRows) {
    if (!rowsByDistrict.has(normalizeDistrictName(district.name))) missingDatabase.push(district.name);
  }
  for (const districtName of rowsByDistrict.keys()) {
    if (!districtsByName.has(districtName)) missingSource.push(districtName);
  }
  if (districtRows.length !== EXPECTED_DISTRICTS || missingSource.length || missingDatabase.length) {
    throw new Error(`District match failed. Database=${districtRows.length}, missing source=${missingSource.join(', ')}, missing database=${missingDatabase.join(', ')}`);
  }

  const pool = getPool();
  const client = await pool.connect();
  let imported = 0;
  try {
    await client.query('BEGIN');
    for (const district of districtRows) {
      const sourceRow = rowsByDistrict.get(normalizeDistrictName(district.name)).row;
      for (const indicator of indicatorColumns) {
        const value = parsePercentage(sourceRow[indicator.column]);
        if (value === null) continue;
        await client.query(
          `INSERT INTO nutrition_indicators
            (district_id, indicator_name, indicator_value, unit, source_name, reporting_period, data_year, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (district_id, indicator_name, source_name, reporting_period)
           DO UPDATE SET indicator_value = EXCLUDED.indicator_value,
                         unit = EXCLUDED.unit,
                         data_year = EXCLUDED.data_year,
                         notes = EXCLUDED.notes,
                         updated_at = CURRENT_TIMESTAMP`,
          [district.id, indicator.name, value, indicator.unit, SOURCE_NAME, REPORTING_PERIOD, DATA_YEAR,
            'Population-level indicator from NFHS-5; not an individual diagnosis or micronutrient deficiency determination.']
        );
        imported += 1;
      }
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  console.log(`[NFHS5] Matched ${districtRows.length} Maharashtra districts and imported ${imported} indicator values.`);
  return { districtsMatched: districtRows.length, indicatorsImported: imported };
}

if (require.main === module) {
  importNfhs5(process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_WORKBOOK)
    .catch((error) => {
      console.error(`[NFHS5] Import failed: ${error.message}`);
      process.exitCode = 1;
    })
    .finally(() => closePool());
}

module.exports = {
  importNfhs5,
  normalizeDistrictName,
  normalizeState,
  readWorkbook,
  DEFAULT_WORKBOOK,
};
