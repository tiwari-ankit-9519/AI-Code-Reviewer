export class SubmissionLimitError extends Error {
  currentCount: number;
  limit: number | string;
  tier: string;
  isInTrial: boolean;

  constructor(data: {
    message: string;
    currentCount: number;
    limit: number | string;
    tier: string;
    isInTrial: boolean;
  }) {
    super(data.message);
    this.name = "SubmissionLimitError";
    this.currentCount = data.currentCount;
    this.limit = data.limit;
    this.tier = data.tier;
    this.isInTrial = data.isInTrial;
    Object.setPrototypeOf(this, SubmissionLimitError.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      currentCount: this.currentCount,
      limit: this.limit,
      tier: this.tier,
      isInTrial: this.isInTrial,
    };
  }
}

export class FileSizeExceededError extends Error {
  fileSize: number;
  maxSize: number;
  tier: string;

  constructor(data: {
    message: string;
    fileSize: number;
    maxSize: number;
    tier: string;
  }) {
    super(data.message);
    this.name = "FileSizeExceededError";
    this.fileSize = data.fileSize;
    this.maxSize = data.maxSize;
    this.tier = data.tier;
    Object.setPrototypeOf(this, FileSizeExceededError.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      fileSize: this.fileSize,
      maxSize: this.maxSize,
      tier: this.tier,
    };
  }
}

export class TrialExpiredError extends Error {
  userId: string;
  expiredAt: Date;

  constructor(data: { message: string; userId: string; expiredAt: Date }) {
    super(data.message);
    this.name = "TrialExpiredError";
    this.userId = data.userId;
    this.expiredAt = data.expiredAt;
    Object.setPrototypeOf(this, TrialExpiredError.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      userId: this.userId,
      expiredAt: this.expiredAt.toISOString(),
    };
  }
}

export class SubscriptionRequiredError extends Error {
  requiredTier: string;
  currentTier: string;

  constructor(data: {
    message: string;
    requiredTier: string;
    currentTier: string;
  }) {
    super(data.message);
    this.name = "SubscriptionRequiredError";
    this.requiredTier = data.requiredTier;
    this.currentTier = data.currentTier;
    Object.setPrototypeOf(this, SubscriptionRequiredError.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      requiredTier: this.requiredTier,
      currentTier: this.currentTier,
    };
  }
}
