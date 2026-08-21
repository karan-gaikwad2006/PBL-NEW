const { query } = require('../config/db');

const DISTRICT_NAME_ALIASES = {
  Ahmednagar: 'Ahilyanagar',
  Ahmadnagar: 'Ahilyanagar',
  Aurangabad: 'Chhatrapati Sambhajinagar',
  Osmanabad: 'Dharashiv',
  Beed: 'Beed',
  Buldhana: 'Buldhana',
  Gondia: 'Gondia',
  Raigad: 'Raigad',
};

function canonicalDistrictName(name) {
  return DISTRICT_NAME_ALIASES[name] || name;
}

function mapDistrictRow(row) {
  return {
    id: row.id,
    name: canonicalDistrictName(row.name),
    slug: row.slug,
    state: row.state,
    nutritionIndicators: row.nutrition_indicators || [],
  };
}

async function findAll() {
  const { rows } = await query(`
    SELECT
      d.id,
      d.name,
      d.slug,
      d.state,
      COALESCE(
        json_agg(
          json_build_object(
            'name', ni.indicator_name,
            'value', ni.indicator_value,
            'unit', ni.unit,
            'sourceName', ni.source_name,
            'sourceUrl', ni.source_url,
            'reportingPeriod', ni.reporting_period,
            'dataYear', ni.data_year,
            'notes', ni.notes
          ) ORDER BY ni.indicator_name
        ) FILTER (WHERE ni.id IS NOT NULL),
        '[]'::json
      ) AS nutrition_indicators
    FROM districts d
    LEFT JOIN nutrition_indicators ni ON ni.district_id = d.id
    WHERE lower(d.state) = 'maharashtra'
    GROUP BY d.id
    ORDER BY d.name ASC
  `);
  return rows.map(mapDistrictRow);
}

async function findById(id) {
  const { rows } = await query(`
    SELECT
      d.id,
      d.name,
      d.slug,
      d.state,
      COALESCE(
        json_agg(
          json_build_object(
            'name', ni.indicator_name,
            'value', ni.indicator_value,
            'unit', ni.unit,
            'sourceName', ni.source_name,
            'sourceUrl', ni.source_url,
            'reportingPeriod', ni.reporting_period,
            'dataYear', ni.data_year,
            'notes', ni.notes
          ) ORDER BY ni.indicator_name
        ) FILTER (WHERE ni.id IS NOT NULL),
        '[]'::json
      ) AS nutrition_indicators
    FROM districts d
    LEFT JOIN nutrition_indicators ni ON ni.district_id = d.id
    WHERE (d.id::text = $1 OR d.slug = $1) AND lower(d.state) = 'maharashtra'
    GROUP BY d.id
    LIMIT 1
  `, [id]);
  return rows[0] ? mapDistrictRow(rows[0]) : null;
}

module.exports = {
  findAll,
  findById,
  canonicalDistrictName,
};
