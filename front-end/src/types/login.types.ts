import type { AdminData } from "./admin.types";

export interface LoginResponse {
    success: boolean;
    message: string;
    admin?: AdminData;
}