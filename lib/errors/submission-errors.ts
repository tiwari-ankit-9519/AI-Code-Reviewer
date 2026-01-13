export class CoolingPeriodError extends Error {
  public endsAt: Date;
  public hoursRemaining: number;

  constructor(message: string, endsAt: Date, hoursRemaining: number) {
    super(message);
    this.name = "CoolingPeriodError";
    this.endsAt = endsAt;
    this.hoursRemaining = hoursRemaining;
  }
}

export class SessionLimitError extends Error {
  public reviewsInSession: number;
  public maxReviews: number;

  constructor(message: string, reviewsInSession: number, maxReviews: number) {
    super(message);
    this.name = "SessionLimitError";
    this.reviewsInSession = reviewsInSession;
    this.maxReviews = maxReviews;
  }
}

export class ConfigValidationError extends Error {
  public field: string;
  public value: unknown;

  constructor(message: string, field: string, value: unknown) {
    super(message);
    this.name = "ConfigValidationError";
    this.field = field;
    this.value = value;
  }
}
