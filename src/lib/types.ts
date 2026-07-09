export interface Track {
  id: string;
  title: string;
  brand: string;
  estilo: string | null;
  audio_path: string;
  cover_path: string | null;
  duration_seconds: number | null;
  created_at: string;
}

export interface Favorite {
  user_id: string;
  track_id: string;
  created_at: string;
  track: Track;
}

export interface Subscription {
  user_id: string;
  plan: "solo" | "squad" | "ilimitado";
  status:
    | "active"
    | "trialing"
    | "past_due"
    | "canceled"
    | "unpaid"
    | "incomplete"
    | "incomplete_expired"
    | "paused"
    | "pending";
  current_period_start: string;
  current_period_end: string;
  stripe_session_id: string | null;
  stripe_payment_id: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
}

export interface DownloadLog {
  id: string;
  user_id: string;
  track_id: string;
  created_at: string;
  track: Track;
}

export interface Encomenda {
  id: string;
  user_id: string;
  codigo_pedido: string;
  nome: string;
  whatsapp: string;
  email: string | null;
  carro: string;
  historia: string;
  estilo: string;
  idioma: string;
  pagamento_confirmado: boolean;
  status: "pendente" | "em_producao" | "entregue";
  audio_path: string | null;
  stripe_session_id: string | null;
  stripe_payment_id: string | null;
  created_at: string;
}

