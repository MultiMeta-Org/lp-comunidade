/**
 * Tipos do banco — schema `comunidade`.
 *
 * ⚠️ ESQUELETO escrito à mão. Quando o projeto Supabase existir, regenerar com:
 *   npx supabase gen types typescript --project-id <ref> --schema comunidade > src/lib/supabase/database.types.ts
 *
 * Mantém os clients tipados (`SupabaseClient<Database, 'comunidade'>`) e reflete
 * as tabelas de `supabase/migrations/0001_init.sql`.
 */

export type AccessStatus = "active" | "revoked"

export type CategoryKey =
  | "objecao"
  | "conversao"
  | "analise"
  | "mindset"
  | "fechamento"

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  comunidade: {
    Tables: {
      authorized_emails: {
        Row: {
          id: string
          email: string
          status: AccessStatus
          source: string | null
          authorized_at: string
          revoked_at: string | null
          hotmart_transaction_id: string | null
          hotmart_product_id: string | null
          buyer_name: string | null
          phone: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          status?: AccessStatus
          source?: string | null
          authorized_at: string
          revoked_at?: string | null
          hotmart_transaction_id?: string | null
          hotmart_product_id?: string | null
          buyer_name?: string | null
          phone?: string | null
          created_at?: string
        }
        Update: Partial<Database["comunidade"]["Tables"]["authorized_emails"]["Insert"]>
        Relationships: []
      }
      login_otps: {
        Row: {
          id: string
          email: string
          code: string
          expires_at: string
          attempts: number
          verified_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          code: string
          expires_at: string
          attempts?: number
          verified_at?: string | null
          created_at?: string
        }
        Update: Partial<Database["comunidade"]["Tables"]["login_otps"]["Insert"]>
        Relationships: []
      }
      admins: {
        Row: {
          email: string
          created_at: string
        }
        Insert: {
          email: string
          created_at?: string
        }
        Update: Partial<Database["comunidade"]["Tables"]["admins"]["Insert"]>
        Relationships: []
      }
      lessons: {
        Row: {
          id: string
          dia: number
          iso_date: string
          weekday: string
          topic: string
          category: string
          description: string
          pdf_url: string | null
          audio_url: string | null
          published: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          dia: number
          iso_date: string
          weekday: string
          topic: string
          category: string
          description: string
          pdf_url?: string | null
          audio_url?: string | null
          published?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["comunidade"]["Tables"]["lessons"]["Insert"]>
        Relationships: []
      }
    }
    Views: Record<never, never>
    Functions: Record<never, never>
    Enums: {
      access_status: AccessStatus
      category_key: CategoryKey
    }
    CompositeTypes: Record<never, never>
  }
}
