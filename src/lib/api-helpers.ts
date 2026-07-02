import { NextResponse } from "next/server";

/**
 * Standardized API response helpers.
 */

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiCreated<T>(data: T) {
  return NextResponse.json({ success: true, data }, { status: 201 });
}

export function apiPaginated<T>(data: T[], pagination: { total: number; page: number; pageSize: number }) {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      ...pagination,
      totalPages: Math.ceil(pagination.total / pagination.pageSize),
    },
  });
}

export function apiError(error: string, status = 400, details?: Record<string, string[]>) {
  const body: any = { success: false, error };
  if (details) body.details = details;
  return NextResponse.json(body, { status });
}

export function apiUnauthorized(msg = "Não autenticado") {
  return NextResponse.json({ success: false, error: msg }, { status: 401 });
}

export function apiForbidden(msg = "Acesso negado") {
  return NextResponse.json({ success: false, error: msg }, { status: 403 });
}

export function apiNotFound(msg = "Recurso não encontrado") {
  return NextResponse.json({ success: false, error: msg }, { status: 404 });
}
