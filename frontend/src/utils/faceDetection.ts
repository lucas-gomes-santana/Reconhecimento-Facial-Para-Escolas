import type { DistanceConfig, DistanceResult, ExpressionStatus } from "../types/distance.types";

export const calculateDistance = (
  faceWidth: number,
  faceHeight: number,
  config: DistanceConfig,
): DistanceResult => {
  const faceSize = Math.sqrt(faceWidth * faceHeight);

  let status: DistanceResult["status"];
  let isIdeal = false;

  if (faceSize < config.minFaceSize) status = "muito_longe";
  else if (faceSize > config.maxFaceSize) status = "muito_perto";
  else if (faceSize >= config.idealMinSize && faceSize <= config.idealMaxSize) {
    status = "ideal";
    isIdeal = true;
  } else if (faceSize < config.idealMinSize) status = "longe";
  else status = "perto";

  return { status, isIdeal, faceSize: Math.round(faceSize) };
};

export const analyzeExpression = (expressions: Record<string, number>): ExpressionStatus => {
  const entries = Object.entries(expressions) as [string, number][];
  const [dominantExpression, confidence] = entries.reduce((max, curr) =>
    curr[1] > max[1] ? curr : max,
  );

  const isNeutral = dominantExpression === "neutral" && confidence >= 0.6;

  const translatedExpressions: Record<string, string> = {
    neutral: "neutra",
    happy: "feliz",
    sad: "triste",
    angry: "raiva",
    fearful: "medo",
    disgusted: "desgosto",
    surprised: "surpreso",
  };

  return {
    expression: translatedExpressions[dominantExpression] || dominantExpression,
    isNeutral,
    confidence: Math.round(confidence * 100),
  };
};
