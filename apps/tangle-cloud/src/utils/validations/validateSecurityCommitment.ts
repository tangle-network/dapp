// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { type FieldErrors } from 'react-hook-form';
import { SecurityCommitment, SecurityRequirement } from '../../types';

export const validateSecurityCommitments = <
  T extends { securityCommitment: SecurityCommitment[] },
>(
  securityCommitment: SecurityCommitment[],
  securityRequirements: SecurityRequirement[],
): FieldErrors<T> => {
  const errors: FieldErrors<T> = {};

  securityCommitment.forEach((commitment, index) => {
    if (!commitment.assetId) {
      if (!errors.securityCommitment) errors.securityCommitment = [];
      if (!errors.securityCommitment[index])
        errors.securityCommitment[index] = {};
      errors.securityCommitment[index].assetId = {
        type: 'required',
        message: 'Asset is required',
      };
    }

    const selectedAsset = securityRequirements?.find(
      (requirement) => requirement.asset === commitment.assetId,
    );
    const minExposurePercent = selectedAsset?.minExposurePercent || 1;
    const maxExposurePercent = selectedAsset?.maxExposurePercent || 100;

    if (commitment.exposurePercent !== undefined) {
      const exposurePercent = Number(commitment.exposurePercent);

      if (!commitment.exposurePercent) {
        if (!errors.securityCommitment) errors.securityCommitment = [];
        if (!errors.securityCommitment[index])
          errors.securityCommitment[index] = {};
        errors.securityCommitment[index].exposurePercent = {
          type: 'required',
          message: 'Exposure percentage is required',
        };
      } else if (isNaN(exposurePercent) || !Number.isInteger(exposurePercent)) {
        if (!errors.securityCommitment) errors.securityCommitment = [];
        if (!errors.securityCommitment[index])
          errors.securityCommitment[index] = {};
        errors.securityCommitment[index].exposurePercent = {
          type: 'integer',
          message: 'Exposure percentage must be an integer',
        };
      } else if (exposurePercent < minExposurePercent) {
        if (!errors.securityCommitment) errors.securityCommitment = [];
        if (!errors.securityCommitment[index])
          errors.securityCommitment[index] = {};
        errors.securityCommitment[index].exposurePercent = {
          type: 'min',
          message: `Exposure percentage must be at least ${minExposurePercent}`,
        };
      } else if (exposurePercent > maxExposurePercent) {
        if (!errors.securityCommitment) errors.securityCommitment = [];
        if (!errors.securityCommitment[index])
          errors.securityCommitment[index] = {};
        errors.securityCommitment[index].exposurePercent = {
          type: 'max',
          message: `Exposure percentage must be less than or equal to ${maxExposurePercent}`,
        };
      }
    }
  });

  return errors;
};
