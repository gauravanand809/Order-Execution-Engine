export interface payload{
    id:string,
}

export interface jobDetail {
  id?: string;
  job_status?:
    | "PENDING"
    | "ROUTING"
    | "BUILDING"
    | "SUBMITTED"
    | "CONFIRMED"
    | "FAILED";
  input_token?: string;
  output_token?: string;
  amount?: string;
  execution_logs?: any[]; 
  tx_hash?: string | null;
  created_at?: Date | string;
  updated_at?: Date | string;
}
