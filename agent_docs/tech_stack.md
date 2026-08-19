# Tech Stack & Tools

- **Frontend:** React + Vite; version to be confirmed during scaffold
- **Backend:** Node.js + Express.js; version to be confirmed during scaffold
- **Database:** Neon PostgreSQL using the `pg` driver; ORM not selected
- **Styling:** Tailwind CSS
- **Routing:** React Router
- **Authentication:** Firebase Authentication; backend verifies Firebase ID tokens
- **File storage:** Cloudinary for documents and media; metadata belongs in PostgreSQL
- **API:** REST/JSON
- **Hosting:** Vercel or equivalent for frontend; Render Free Web Service or equivalent for backend
- **Source control:** Git + GitHub
- **Maps:** browser/map library with a verified map data source; provider remains an implementation decision
- **Notifications:** PostgreSQL plus the application layer for in-app notifications

## Setup and Deployment
Development uses separate `client/.env` and `server/.env` files. Never commit secrets. Production variables belong in the hosting provider. Frontend deployment connects GitHub to Vercel, while backend deployment connects GitHub to a Render web service and configures build/start commands.

The design does not pin versions or package scripts. Confirm the generated `package.json` files before using `npm run dev`, `npm test`, `npm run lint`, or `npm run build`.

## Error Handling Pattern
```ts
export type ApiError = {
  code: string;
  message: string;
};

export function toApiError(error: unknown): ApiError {
  console.error(error);
  return {
    code: "INTERNAL_ERROR",
    message: "Something went wrong. Please try again."
  };
}
```

Normalize errors at API boundaries, log developer context on the server, and show safe messages to users.

## Canonical Backend Boundary
```ts
router.post("/requirements", requireAuth, validate(createRequirementSchema), async (request, response) => {
  const requirement = await requirementService.create(request.user.id, request.body);
  response.status(201).json(requirement);
});
```

Route handlers authenticate and validate. Services own business rules; repositories own database access.

## Canonical Frontend Request
```tsx
async function loadRequirements(): Promise<Requirement[]> {
  const response = await fetch(`${API_URL}/requirements`);
  if (!response.ok) throw new Error("Unable to load requirements");
  return response.json() as Promise<Requirement[]>;
}
```

Keep API calls in feature data modules, not inside presentational render functions. Use deterministic matching and structured data when AI is unavailable.
