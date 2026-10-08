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
          /** Posse do Desafio 21 Dias. DERIVADA — ver refresh_desafio_entitlement. */
          has_desafio: boolean
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
          has_desafio?: boolean
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

      // ── Desafio 21 Dias ──────────────────────────────────────────
      /** Ids de produto da Hotmart que valem como Desafio. */
      desafio_products: {
        Row: { hotmart_product_id: string; label: string | null; created_at: string }
        Insert: { hotmart_product_id: string; label?: string | null; created_at?: string }
        Update: Partial<Database["comunidade"]["Tables"]["desafio_products"]["Insert"]>
        Relationships: []
      }
      /** Cortesias: o sinal positivo que sobrevive ao sync. */
      desafio_grants: {
        Row: { email: string; motivo: string | null; created_at: string }
        Insert: { email: string; motivo?: string | null; created_at?: string }
        Update: Partial<Database["comunidade"]["Tables"]["desafio_grants"]["Insert"]>
        Relationships: []
      }
      /** Postbacks do Desafio recebidos pelo PRÓPRIO portal. */
      desafio_purchases: {
        Row: {
          id: string
          email: string
          hotmart_product_id: string | null
          transaction_id: string | null
          event_type: string
          origem: string
          occurred_at: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          hotmart_product_id?: string | null
          transaction_id?: string | null
          event_type: string
          origem?: string
          occurred_at?: string
          created_at?: string
        }
        Update: Partial<Database["comunidade"]["Tables"]["desafio_purchases"]["Insert"]>
        Relationships: []
      }
      /**
       * Progresso e respostas da aluna, uma linha por (email, dia).
       * As chaves de `respostas` são declaradas em src/lib/desafio/dias/*.ts.
       */
      desafio_progresso: {
        Row: {
          email: string
          dia: number
          passo: number
          respostas: Json
          started_at: string
          completed_at: string | null
          updated_at: string
        }
        Insert: {
          email: string
          dia: number
          passo?: number
          respostas?: Json
          started_at?: string
          completed_at?: string | null
          updated_at?: string
        }
        Update: Partial<Database["comunidade"]["Tables"]["desafio_progresso"]["Insert"]>
        Relationships: []
      }
      /** As empresas do Radar (meta de 100). Vivo: recebe empresa em qualquer dia. */
      desafio_radar: {
        Row: {
          id: string
          email: string
          nome: string
          segmento: string | null
          contato: string | null
          origem: string | null
          dia_origem: number | null
          /** Raio-X e respostas de missão ligadas a esta empresa — exercício,
           *  não fato sobre a empresa. */
          notas: Json
          /** Estágio comercial. Avança pelas missões, a partir do Dia 7. */
          status: string
          ultima_acao: string | null
          ultima_acao_em: string | null
          proxima_acao: string | null
          proxima_acao_em: string | null
          arquivada_em: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          nome: string
          segmento?: string | null
          contato?: string | null
          origem?: string | null
          dia_origem?: number | null
          notas?: Json
          status?: string
          ultima_acao?: string | null
          ultima_acao_em?: string | null
          proxima_acao?: string | null
          proxima_acao_em?: string | null
          arquivada_em?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["comunidade"]["Tables"]["desafio_radar"]["Insert"]>
        Relationships: []
      }
      /** Interesses demonstrados (hoje: closer-presencial). */
      desafio_interesses: {
        Row: {
          email: string
          interesse: string
          resposta: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          email: string
          interesse: string
          resposta?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["comunidade"]["Tables"]["desafio_interesses"]["Insert"]>
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
      /** A matrícula do Dia Zero como colunas (o jsonb traduzido no banco). */
      desafio_matriculas: {
        Row: {
          email: string
          buyer_name: string | null
          apelido: string | null
          nome_completo: string | null
          idade: number | null
          cidade: string | null
          uf: string | null
          estado_civil: string | null
          tem_filhos: boolean | null
          quantos_filhos: number | null
          formacao: string | null
          momento_profissional: string | null
          areas: string | null
          experiencia_vendas: string | null
          experiencia_atendimento: string | null
          motivos: Json
          maior_dificuldade: string | null
          relato: string | null
          objetivo_renda: string | null
          tempo_disponivel: string | null
          periodo: string | null
          baseline_conversa: number | null
          baseline_contrato: number | null
          baseline_fechamento: number | null
          compromisso: boolean | null
          concluida_em: string | null
          comecada_em: string
        }
        Relationships: []
      }
      desafio_visao_geral: {
        Row: {
          com_acesso: number
          comecaram_matricula: number
          matricula_concluida: number
          idade_media: number | null
          maes: number
          filhos_media: number | null
          ufs: number
        }
        Relationships: []
      }
      /** Quantas abriram e concluíram cada dia. Dia sem ninguém vem com zero. */
      desafio_funil: {
        Row: { dia: number; abriram: number; concluiram: number }
        Relationships: []
      }
      /** As três notas de 0 a 10 do Dia 0 contra as mesmas no Dia 21. */
      desafio_transformacao: {
        Row: {
          indicador: string
          entrada: number | null
          saida: number | null
          evolucao: number | null
          respondentes: number
        }
        Relationships: []
      }
      desafio_motivos: {
        Row: { motivo: string; alunas: number; pct: number | null }
        Relationships: []
      }
      desafio_dores: {
        Row: { dor: string; alunas: number; pct: number | null }
        Relationships: []
      }
      desafio_radar_stats: {
        Row: {
          email: string
          empresas: number
          por_indicacao: number
          primeira: string
          ultima: string
        }
        Relationships: []
      }
      /** O placar comercial, derivado do status das empresas do Radar. */
      desafio_placar: {
        Row: {
          email: string
          no_radar: number
          trabalhadas: number
          abordadas: number
          em_conversa: number
          reunioes: number
          propostas: number
          fechados: number
          sem_interesse: number
        }
        Relationships: []
      }
      /** Distribuições categóricas da matrícula, um recorte por `campo`. */
      desafio_distribuicao: {
        Row: { campo: string; valor: string; alunas: number; pct: number | null }
        Relationships: []
      }
      /** Uma linha por aluna com o Desafio: onde parou e o que construiu. */
      desafio_alunas: {
        Row: {
          email: string
          buyer_name: string | null
          apelido: string | null
          uf: string | null
          matricula_concluida: boolean
          dias_concluidos: number
          ultimo_dia_aberto: number | null
          atualizado_em: string | null
          no_radar: number
          abordadas: number
          em_conversa: number
          reunioes: number
          propostas: number
          fechados: number
        }
        Relationships: []
      }
      desafio_closer_presencial: {
        Row: { disponibilidade: string; uf: string | null; alunas: number }
        Relationships: []
      }
    }
    Functions: {
      /** Recalcula has_comunidade_vip a partir das compras (ver migration do CRM). */
      refresh_vip_entitlement: {
        Args: { p_email?: string | null }
        Returns: number
      }
      /** Recalcula has_desafio: compra registrada ou cortesia (ver migration do CRM). */
      refresh_desafio_entitlement: {
        Args: { p_email?: string | null }
        Returns: number
      }
      /**
       * Grava o avanço de um passo da missão, MESCLANDO as respostas no jsonb
       * existente — um passo grava só as chaves dele. A mesclagem é feita no
       * banco para não depender de ler-antes-de-escrever, que perderia a
       * corrida com dois cliques rápidos. O passo nunca retrocede.
       */
      desafio_salvar_passo: {
        Args: { p_email: string; p_dia: number; p_passo: number; p_respostas: Json }
        Returns: undefined
      }
      /** Conclui o dia. Reconcluir (revisão) mantém o completed_at original. */
      desafio_concluir_dia: {
        Args: { p_email: string; p_dia: number; p_respostas: Json }
        Returns: undefined
      }
      /** Notas de uma empresa do Radar, agrupadas por dia. Exige o e-mail junto do id. */
      desafio_salvar_notas: {
        Args: { p_email: string; p_id: string; p_dia: number; p_notas: Json }
        Returns: undefined
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
