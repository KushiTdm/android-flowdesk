// ---------------------------------------------------------------------------
// airtable.service.ts — Airtable REST API wrapper
// ---------------------------------------------------------------------------

import { AirtableError } from '../utils/error.utils';

const BASE_URL = 'https://api.airtable.com/v0';
const META_URL = 'https://api.airtable.com/v0/meta';

export interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
  createdTime: string;
}

export interface AirtableTable {
  id: string;
  name: string;
  primaryFieldId: string;
}

interface AirtableListResponse {
  records: AirtableRecord[];
  offset?: string;
}

interface AirtableCreateResponse {
  id: string;
  fields: Record<string, unknown>;
  createdTime: string;
}

interface AirtableMetaTablesResponse {
  tables: AirtableTable[];
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function authHeaders(apiKey: string): HeadersInit {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
}

async function throwOnAirtableError(response: Response): Promise<void> {
  if (!response.ok) {
    let body = '';
    try {
      body = await response.text();
    } catch {
      // ignore
    }
    throw new AirtableError(
      `Airtable HTTP ${response.status}: ${body}`,
      response.status,
    );
  }
}

// ---------------------------------------------------------------------------
// AirtableService
// ---------------------------------------------------------------------------

export const AirtableService = {
  /**
   * Fetches available tables from a base using the Airtable Metadata API.
   * Lets the user pick which table to use instead of typing the ID.
   */
  async listTables(
    apiKey: string,
    baseId: string,
  ): Promise<AirtableTable[]> {
    const response = await fetch(`${META_URL}/bases/${baseId}/tables`, {
      headers: authHeaders(apiKey),
      signal: AbortSignal.timeout(10_000),
    });

    await throwOnAirtableError(response);

    const data = (await response.json()) as AirtableMetaTablesResponse;
    return data.tables ?? [];
  },

  /** Fetches all records from a table (handles pagination) */
  async listRecords(
    apiKey: string,
    baseId: string,
    tableId: string,
  ): Promise<AirtableRecord[]> {
    const allRecords: AirtableRecord[] = [];
    let offset: string | undefined;

    do {
      const url = new URL(`${BASE_URL}/${baseId}/${tableId}`);
      if (offset) url.searchParams.set('offset', offset);

      const response = await fetch(url.toString(), {
        headers: authHeaders(apiKey),
        signal: AbortSignal.timeout(10_000),
      });

      await throwOnAirtableError(response);

      const data = (await response.json()) as AirtableListResponse;
      allRecords.push(...data.records);
      offset = data.offset;
    } while (offset);

    return allRecords;
  },

  /** Creates a new record and returns its Airtable record ID */
  async createRecord(
    apiKey: string,
    baseId: string,
    tableId: string,
    fields: Record<string, unknown>,
  ): Promise<string> {
    const response = await fetch(`${BASE_URL}/${baseId}/${tableId}`, {
      method: 'POST',
      headers: authHeaders(apiKey),
      body: JSON.stringify({ fields }),
      signal: AbortSignal.timeout(10_000),
    });

    await throwOnAirtableError(response);

    const data = (await response.json()) as AirtableCreateResponse;
    return data.id;
  },

  /** Updates an existing record by ID */
  async updateRecord(
    apiKey: string,
    baseId: string,
    tableId: string,
    recordId: string,
    fields: Record<string, unknown>,
  ): Promise<void> {
    const response = await fetch(`${BASE_URL}/${baseId}/${tableId}/${recordId}`, {
      method: 'PATCH',
      headers: authHeaders(apiKey),
      body: JSON.stringify({ fields }),
      signal: AbortSignal.timeout(10_000),
    });

    await throwOnAirtableError(response);
  },

  /** Deletes a record by ID */
  async deleteRecord(
    apiKey: string,
    baseId: string,
    tableId: string,
    recordId: string,
  ): Promise<void> {
    const response = await fetch(`${BASE_URL}/${baseId}/${tableId}/${recordId}`, {
      method: 'DELETE',
      headers: authHeaders(apiKey),
      signal: AbortSignal.timeout(10_000),
    });

    await throwOnAirtableError(response);
  },

  /** Validates API key + base by listing tables metadata */
  async validateCredentials(apiKey: string, baseId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${META_URL}/bases/${baseId}/tables`,
        {
          headers: authHeaders(apiKey),
          signal: AbortSignal.timeout(5_000),
        },
      );
      return response.ok;
    } catch {
      return false;
    }
  },
};