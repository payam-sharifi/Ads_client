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
  const { locale, isRTL } = useI18n();

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
          {isRTL ? 'عنوان شغل' : 'Job Title'} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={data.jobTitle || ''}
          onChange={(e) => updateField('jobTitle', e.target.value)}
          placeholder={isRTL ? 'توسعه‌دهنده Full Stack' : 'Full Stack Developer'}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          dir={isRTL ? 'rtl' : 'ltr'}
        />
      </div>

      {/* Job Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isRTL ? 'توضیحات شغل' : 'Job Description'} <span className="text-red-500">*</span>
        </label>
        <textarea
          value={data.jobDescription || ''}
          onChange={(e) => updateField('jobDescription', e.target.value)}
          placeholder={isRTL ? 'ما در حال جستجوی...' : 'We are looking for...'}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          rows={5}
          dir={isRTL ? 'rtl' : 'ltr'}
        />
      </div>

      {/* Job Type & Industry */}
      <div className="grid grid-cols-2 gap-4">
        <div className="relative z-10">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isRTL ? 'نوع شغل' : 'Job Type'} <span className="text-red-500">*</span>
          </label>
          <div className="relative" style={{ zIndex: 1000 }}>
            <select
              value={data.jobType || ''}
              onChange={(e) => updateField('jobType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
            <option value="">{isRTL ? 'انتخاب کنید' : 'Select...'}</option>
            <option value={JobType.FULL_TIME}>{isRTL ? 'تمام وقت' : 'Full-time'}</option>
            <option value={JobType.PART_TIME}>{isRTL ? 'پاره وقت' : 'Part-time'}</option>
            <option value={JobType.MINI_JOB}>{isRTL ? 'مینی جاب' : 'Mini-job'}</option>
            <option value={JobType.FREELANCE}>{isRTL ? 'فریلنسر' : 'Freelance'}</option>
            <option value={JobType.INTERNSHIP}>{isRTL ? 'کارآموزی' : 'Internship'}</option>
          </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isRTL ? 'صنعت' : 'Industry'} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.industry || ''}
            onChange={(e) => updateField('industry', e.target.value)}
            placeholder={isRTL ? 'IT & Software' : 'IT & Software'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            dir={isRTL ? 'rtl' : 'ltr'}
          />
        </div>
      </div>

      {/* Experience Level */}
      <div className="relative z-10">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isRTL ? 'سطح تجربه' : 'Experience Level'} <span className="text-gray-400 text-xs">({isRTL ? 'اختیاری' : 'Optional'})</span>
        </label>
        <div className="relative" style={{ zIndex: 1000 }}>
          <select
            value={data.experienceLevel || ''}
            onChange={(e) => updateField('experienceLevel', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
          <option value="">{isRTL ? 'انتخاب کنید' : 'Select...'}</option>
          <option value={ExperienceLevel.JUNIOR}>{isRTL ? 'جونیور' : 'Junior'}</option>
          <option value={ExperienceLevel.MID}>{isRTL ? 'میانه' : 'Mid-level'}</option>
          <option value={ExperienceLevel.SENIOR}>{isRTL ? 'سنیور' : 'Senior'}</option>
          </select>
        </div>
      </div>

      {/* Education Required */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isRTL ? 'تحصیلات مورد نیاز' : 'Education Required'} <span className="text-gray-400 text-xs">({isRTL ? 'اختیاری' : 'Optional'})</span>
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

      {/* Language Required */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isRTL ? 'زبان مورد نیاز' : 'Language Required'} <span className="text-gray-400 text-xs">({isRTL ? 'اختیاری' : 'Optional'})</span>
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

      {/* Remote Possible */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={data.remotePossible || false}
            onChange={(e) => updateField('remotePossible', e.target.checked)}
            className="mr-2"
          />
          {isRTL ? 'امکان کار از راه دور' : 'Remote work possible'}
        </label>
      </div>

      {/* Salary */}
      <div className="pt-4 border-t">
        <h3 className="text-lg font-medium text-gray-900 mb-3">{isRTL ? 'حقوق' : 'Salary'}</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isRTL ? 'از (€)' : 'From (€)'} <span className="text-gray-400 text-xs">({isRTL ? 'اختیاری' : 'Optional'})</span>
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
              {isRTL ? 'تا (€)' : 'To (€)'} <span className="text-gray-400 text-xs">({isRTL ? 'اختیاری' : 'Optional'})</span>
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
            {isRTL ? 'نوع حقوق' : 'Salary Type'} <span className="text-gray-400 text-xs">({isRTL ? 'اختیاری' : 'Optional'})</span>
          </label>
          <div className="relative" style={{ zIndex: 1000 }}>
            <select
              value={data.salaryType || ''}
              onChange={(e) => updateField('salaryType', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
            <option value="">{isRTL ? 'انتخاب کنید' : 'Select...'}</option>
            <option value={SalaryType.HOURLY}>{isRTL ? 'ساعتی' : 'Hourly'}</option>
            <option value={SalaryType.MONTHLY}>{isRTL ? 'ماهانه' : 'Monthly'}</option>
          </select>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="pt-4 border-t">
        <h3 className="text-lg font-medium text-gray-900 mb-3">{isRTL ? 'اطلاعات تماس' : 'Contact Information'}</h3>
        
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isRTL ? 'نام شرکت' : 'Company Name'} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.companyName || ''}
            onChange={(e) => updateField('companyName', e.target.value)}
            placeholder={isRTL ? 'Tech Startup GmbH' : 'Tech Startup GmbH'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            dir={isRTL ? 'rtl' : 'ltr'}
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isRTL ? 'نام تماس' : 'Contact Name'} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.contactName || ''}
            onChange={(e) => updateField('contactName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            dir={isRTL ? 'rtl' : 'ltr'}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isRTL ? 'ایمیل تماس' : 'Contact Email'} <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={data.contactEmail || ''}
            onChange={(e) => updateField('contactEmail', e.target.value)}
            placeholder={isRTL ? 'jobs@company.com' : 'jobs@company.com'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            dir="ltr"
          />
        </div>
      </div>
    </div>
  );
}

