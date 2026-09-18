import { Express } from "express";

export interface RequestWithUser extends Express.Request {
  user?: {
    id: string;
    email: string;
    displayName: string;
  };
}
