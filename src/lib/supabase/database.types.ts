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
          has_comunidade_vip: boolean
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
          has_comunidade_vip?: boolean
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
          video_url: string | null
          published: boolean
          /** Vídeo liberado para toda aluna autorizada (Plantão Tira Dúvidas). */
          open_to_all: boolean
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
          video_url?: string | null
          published?: boolean
          open_to_all?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["comunidade"]["Tables"]["lessons"]["Insert"]>
        Relationships: []
      }
      lesson_progress: {
        Row: {
          lesson_id: string
          email: string
          first_viewed_at: string
          completed_at: string | null
        }
        Insert: {
          lesson_id: string
          email: string
          first_viewed_at?: string
          completed_at?: string | null
        }
        Update: Partial<Database["comunidade"]["Tables"]["lesson_progress"]["Insert"]>
        Relationships: []
      }
      banners: {
        Row: {
          id: string
          /** Nome interno, só para a admin reconhecer a linha. Não vai para a tela. */
          label: string
          image_url: string
          image_mobile_url: string | null
          href: string
          cta: string
          alt: string
          sort_order: number
          active: boolean
          starts_at: string | null
          ends_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          label?: string
          image_url: string
          image_mobile_url?: string | null
          href: string
          cta?: string
          alt?: string
          sort_order?: number
          active?: boolean
          starts_at?: string | null
          ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["comunidade"]["Tables"]["banners"]["Insert"]>
        Relationships: []
      }
      vip_grants: {
        Row: {
          email: string
          motivo: string | null
          created_at: string
        }
        Insert: {
          email: string
          motivo?: string | null
          created_at?: string
        }
        Update: Partial<Database["comunidade"]["Tables"]["vip_grants"]["Insert"]>
        Relationships: []
      }
      vip_sync_runs: {
        Row: {
          id: string
          ran_at: string
          ok: boolean
          vendas_lidas: number
          acessos_alterados: number
          alunas_criadas: number
          /** Produtos da Hotmart com cara de VIP que ninguém cadastrou. */
          produtos_desconhecidos: { id: string; nome: string }[]
          erro: string | null
        }
        Insert: {
          id?: string
          ran_at?: string
          ok: boolean
          vendas_lidas?: number
          acessos_alterados?: number
          alunas_criadas?: number
          produtos_desconhecidos?: { id: string; nome: string }[]
          erro?: string | null
        }
        Update: Partial<Database["comunidade"]["Tables"]["vip_sync_runs"]["Insert"]>
        Relationships: []
      }
      vip_purchases: {
        Row: {
          id: string
          email: string
          hotmart_product_id: string | null
          transaction_id: string | null
          event_type: string
          occurred_at: string
          created_at: string
          /** 'postback' | 'hotmart_api' | 'closer' — de onde veio o fato. */
          origem: string
        }
        Insert: {
          id?: string
          email: string
          hotmart_product_id?: string | null
          transaction_id?: string | null
          event_type: string
          occurred_at?: string
          created_at?: string
          origem?: string
        }
        Update: Partial<Database["comunidade"]["Tables"]["vip_purchases"]["Insert"]>
        Relationships: []
      }
      vip_products: {
        Row: {
          id: string
          /** Produto na Hotmart. Null quando a VIP só existe no catálogo do CRM. */
          hotmart_product_id: string | null
          /** Produto em public.products — a venda fechada por closer. */
          crm_product_id: string | null
          label: string | null
          created_at: string
        }
        Insert: {
          id?: string
          hotmart_product_id?: string | null
          crm_product_id?: string | null
          label?: string | null
          created_at?: string
        }
        Update: Partial<Database["comunidade"]["Tables"]["vip_products"]["Insert"]>
        Relationships: []
      }
    }
    Views: {
      /** Por aula: tamanho da turma, quantas abriram e quantas concluíram. */
      lesson_progress_stats: {
        Row: {
          lesson_id: string
          elegiveis: number
          abriram: number
          concluiram: number
        }
        Relationships: []
      }
    }
    Functions: {
      /** Recalcula has_comunidade_vip a partir das compras (ver migration do CRM). */
      refresh_vip_entitlement: {
        Args: { p_email?: string | null }
        Returns: number
      }
      /** Alunas da turma desta aula que nunca abriram a página dela. */
      lesson_ausentes: {
        Args: { p_lesson_id: string }
        Returns: { email: string; buyer_name: string | null }[]
      }
      /** Alunas da turma que abriram esta aula, concluídas primeiro. */
      lesson_presentes: {
        Args: { p_lesson_id: string }
        Returns: {
          email: string
          buyer_name: string | null
          first_viewed_at: string
          completed_at: string | null
        }[]
      }
    }
    Enums: {
      access_status: AccessStatus
      category_key: CategoryKey
    }
    CompositeTypes: Record<never, never>
  }
}
