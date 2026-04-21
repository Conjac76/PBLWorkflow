import { z } from "zod";
export const milestoneStatusSchema = z.enum([
    "not_started",
    "in_progress",
    "complete",
    "revised",
]);
export const createMilestoneSchema = z.object({
    groupId: z.string().min(1),
    title: z.string().min(1),
    description: z.string().default(""),
    goalDate: z.string().datetime().optional(),
    status: milestoneStatusSchema.default("not_started"),
    definitionOfDone: z.string().default(""),
});
export const updateMilestoneSchema = createMilestoneSchema.partial().omit({ groupId: true });
export const createArtifactSchema = z.object({
    groupId: z.string().min(1),
    title: z.string().min(1),
    url: z.string().url(),
    date: z.string().datetime().optional(),
    note: z.string().default(""),
    milestoneId: z.string().optional(),
    parentArtifactId: z.string().optional(),
    isRevision: z.boolean().default(false),
});
export const updateArtifactSchema = createArtifactSchema.partial().omit({ groupId: true });
export const createCheckInSchema = z.object({
    groupId: z.string().min(1),
    milestoneId: z.string().optional(),
    title: z.string().min(1),
    text: z.string().min(1),
    blockers: z.string().default(""),
    helpRequested: z.boolean().default(false),
    attemptCount: z.number().int().min(0).default(0),
});
export const updateCheckInSchema = createCheckInSchema.partial().omit({ groupId: true });
export const createCommentSchema = z.object({
    groupId: z.string().min(1),
    title: z.string().min(1),
    text: z.string().min(1),
    targetType: z.enum(["milestone", "artifact", "checkin"]),
    targetId: z.string().min(1),
});
export const updateCommentSchema = createCommentSchema.partial().omit({ groupId: true });
export const createGroupSchema = z.object({
    projectId: z.string().min(1),
    name: z.string().min(1),
});
