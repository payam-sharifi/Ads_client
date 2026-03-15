'use client';

import React from 'react';
import { useI18n } from '@/lib/contexts/I18nContext';
import { JobType, ExperienceLevel, SalaryType, JobMetadata } from '@/lib/types/category.types';

interface JobFormProps {
  data: Partial<JobMetadata>;
  onChange: (data: Partial<JobMetadata>) => void;
  errors?: Record<string, string>;
}

export default function JobForm({ data, onChange, errors = {} }: JobFormProps) {
  const { locale, isRTL ,t} = useI18n();

  const updateField = (field: keyof JobMetadata, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const getFieldError = (field: string) => {
    return errors[field];
  };

  return (
    <div className="space-y-4 overflow-visible relative">
      {/* Job Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('ad.jobTitle')} <span className="text-primary-500">*</span>
        </label>
        <input
          type="text"
          value={data.jobTitle || ''}
          onChange={(e) => updateField('jobTitle', e.target.value)}
          placeholder={t('ad.fullStackDeveloper')}
          className={`w-full px-3 py-2 border rounded-lg ${
            getFieldError('jobTitle') ? 'border-primary-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-primary-500`}
          dir={isRTL ? 'rtl' : 'ltr'}
        />
        {getFieldError('jobTitle') && (
          <p className="mt-1 text-sm text-primary-600">{getFieldError('jobTitle')}</p>
        )}
      </div>

      {/* Job Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('ad.jobDescription')} <span className="text-primary-500">*</span>
        </label>
        <textarea
          value={data.jobDescription || ''}
          onChange={(e) => updateField('jobDescription', e.target.value)}
          placeholder={t('ad.weAreLookingFor')}
          className={`w-full px-3 py-2 border rounded-lg ${
            getFieldError('jobDescription') ? 'border-primary-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-primary-500`}
          rows={5}
          dir={isRTL ? 'rtl' : 'ltr'}
        />
        {getFieldError('jobDescription') && (
          <p className="mt-1 text-sm text-primary-600">{getFieldError('jobDescription')}</p>
        )}
      </div>

      {/* Job Type & Industry */}
      <div className="grid grid-cols-2 gap-4">
        <div className="relative z-10">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('ad.jobType')} <span className="text-primary-500">*</span>
          </label>
          <div className="relative" style={{ zIndex: 1000 }}>
            <select
              value={data.jobType || ''}
              onChange={(e) => updateField('jobType', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg ${
                getFieldError('jobType') ? 'border-primary-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-primary-500`}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
            <option value="">{t('common.select')}...</option>
            <option value={JobType.FULL_TIME}>{t('ad.fullTime')}</option>
            <option value={JobType.PART_TIME}>{t('ad.partTime')}</option>
            <option value={JobType.MINI_JOB}>{t('ad.miniJob')}</option>
            <option value={JobType.FREELANCE}>{t('ad.freelance')}</option>
            <option value={JobType.INTERNSHIP}>{t('ad.internship')}</option>
          </select>
          </div>
        {getFieldError('jobType') && (
          <p className="mt-1 text-sm text-primary-600">{getFieldError('jobType')}</p>
        )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('ad.industry')} <span className="text-primary-500">*</span>
          </label>
          <input
            type="text"
            value={data.industry || ''}
            onChange={(e) => updateField('industry', e.target.value)}
            placeholder={isRTL ? 'IT & Software' : 'IT & Software'}
            className={`w-full px-3 py-2 border rounded-lg ${
              getFieldError('industry') ? 'border-primary-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-primary-500`}
            dir={isRTL ? 'rtl' : 'ltr'}
          />
          {getFieldError('industry') && (
            <p className="mt-1 text-sm text-primary-600">{getFieldError('industry')}</p>
          )}
        </div>
      </div>

      {/* Experience Level - Desktop: 2 columns, Mobile: 1 column */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative z-10">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('ad.experienceLevel')} <span className="text-gray-400 text-xs">({t('common.optional')})</span>
          </label>
          <div className="relative" style={{ zIndex: 1000 }}>
            <select
              value={data.experienceLevel || ''}
              onChange={(e) => updateField('experienceLevel', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
            <option value="">{t('common.select')}...</option>
            <option value={ExperienceLevel.JUNIOR}>{t('ad.junior')}</option>
            <option value={ExperienceLevel.MID}>{t('ad.mid')}</option>
            <option value={ExperienceLevel.SENIOR}>{t('ad.senior')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Education Required & Language Required */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('ad.educationRequired')} <span className="text-gray-400 text-xs">({t('common.optional')})</span>
          </label>
          <input
            type="text"
            value={data.educationRequired || ''}
            onChange={(e) => updateField('educationRequired', e.target.value || undefined)}
            placeholder={isRTL ? 'Bachelor in Computer Science' : 'Bachelor in Computer Science'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            dir={isRTL ? 'rtl' : 'ltr'}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('ad.languageRequired')} <span className="text-gray-400 text-xs">({t('common.optional')})</span>
          </label>
          <input
            type="text"
            value={data.languageRequired || ''}
            onChange={(e) => updateField('languageRequired', e.target.value || undefined)}
            placeholder={isRTL ? 'German B2, English C1' : 'German B2, English C1'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            dir={isRTL ? 'rtl' : 'ltr'}
          />
        </div>
      </div>

      {/* Remote Possible */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={data.remotePossible || false}
            onChange={(e) => updateField('remotePossible', e.target.checked)}
            className="mr-2"
          />
          {t('ad.remoteWork')}
        </label>
      </div>

      {/* Salary */}
      <div className="pt-4 border-t">
        <h3 className="text-lg font-medium text-gray-900 mb-3">{t('ad.salary')}</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('ad.from')} (€) <span className="text-gray-400 text-xs">({t('common.optional')})</span>
            </label>
            <input
              type="number"
              value={data.salaryFrom || ''}
              onChange={(e) => updateField('salaryFrom', parseFloat(e.target.value) || undefined)}
              placeholder={isRTL ? '45000' : '45000'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              dir="ltr"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.to')} (€) <span className="text-gray-400 text-xs">({t('common.optional')})</span>
            </label>
            <input
              type="number"
              value={data.salaryTo || ''}
              onChange={(e) => updateField('salaryTo', parseFloat(e.target.value) || undefined)}
              placeholder={isRTL ? '60000' : '60000'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              dir="ltr"
              min="0"
            />
          </div>
        </div>

        <div className="relative z-10">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('ad.salaryType')} <span className="text-gray-400 text-xs">({t('common.optional')})</span>
          </label>
          <div className="relative" style={{ zIndex: 1000 }}>
            <select
              value={data.salaryType || ''}
              onChange={(e) => updateField('salaryType', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
            <option value="">{t('common.select')}...</option>
            <option value={SalaryType.HOURLY}>{t('ad.hourly')}</option>
            <option value={SalaryType.MONTHLY}>{t('ad.monthly')}</option>
          </select>
          </div>
        </div>
      </div>

      {/* Company Name */}
      <div className="pt-4 border-t">
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('ad.companyName')} <span className="text-primary-500">*</span>
          </label>
          <input
            type="text"
            value={data.companyName || ''}
            onChange={(e) => updateField('companyName', e.target.value)}
            placeholder={isRTL ? 'Tech Startup GmbH' : 'Tech Startup GmbH'}
            className={`w-full px-3 py-2 border rounded-lg ${
              getFieldError('companyName') ? 'border-primary-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-primary-500`}
            dir={isRTL ? 'rtl' : 'ltr'}
          />
          {getFieldError('companyName') && (
            <p className="mt-1 text-sm text-primary-600">{getFieldError('companyName')}</p>
          )}
        </div>
      </div>
    </div>
  );
}

