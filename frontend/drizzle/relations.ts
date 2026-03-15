import { relations } from "drizzle-orm/relations";
import {
  account,
  chatMessages,
  chatSessions,
  datasets,
  notebooks,
  projects,
  session,
  user,
} from "./schema";

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const userRelations = relations(user, ({ many }) => ({
  accounts: many(account),
  sessions: many(session),
  projects: many(projects),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(user, {
    fields: [projects.userId],
    references: [user.id],
  }),
  datasets: many(datasets),
  notebooks: many(notebooks),
  chatSessions: many(chatSessions),
}));

export const datasetsRelations = relations(datasets, ({ one }) => ({
  project: one(projects, {
    fields: [datasets.projectId],
    references: [projects.projectId],
  }),
}));

export const notebooksRelations = relations(notebooks, ({ one }) => ({
  project: one(projects, {
    fields: [notebooks.projectId],
    references: [projects.projectId],
  }),
}));

export const chatSessionsRelations = relations(
  chatSessions,
  ({ one, many }) => ({
    project: one(projects, {
      fields: [chatSessions.projectId],
      references: [projects.projectId],
    }),
    chatMessages: many(chatMessages),
  }),
);

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  chatSession: one(chatSessions, {
    fields: [chatMessages.sessionId],
    references: [chatSessions.sessionId],
  }),
}));
