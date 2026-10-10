import { createObjectCsvWriter } from 'csv-writer';
import * as fs from 'fs';
import * as path from 'path';
import type { Lead } from './types';

function slugify(text: string): string {
  const slug = (text ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return slug || 'leads';
}

function buildFilename(query: string, ext: 'csv' | 'json'): string {
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .slice(0, 19);
  return `ziara-${slugify(query)}-${timestamp}.${ext}`;
}

function flattenLead(lead: Lead): Record<string, string> {
  return {
    title: lead.title ?? '',
    rating: lead.rating ?? '',
    reviews: lead.reviews ?? '',
    category: lead.category ?? '',
    phone: lead.phone ?? '',
    website: lead.website ?? '',
    address: lead.address ?? '',
    mapsUrl: lead.mapsUrl ?? '',
    email: lead.email ?? '',
    linkedin: lead.socials?.linkedin ?? '',
    twitter: lead.socials?.twitter ?? '',
    instagram: lead.socials?.instagram ?? '',
    facebook: lead.socials?.facebook ?? '',
  };
}

async function exportCsv(leads: Lead[], outputPath: string): Promise<void> {
  const hasEnrichment = leads.some(
    (l) =>
      Boolean(l.email) ||
      Boolean(l.socials && Object.values(l.socials).some(Boolean)) ||
      l.email !== undefined
  );

  const baseHeaders = [
    { id: 'title', title: 'Business Name' },
    { id: 'rating', title: 'Rating' },
    { id: 'reviews', title: 'Reviews' },
    { id: 'category', title: 'Category' },
    { id: 'phone', title: 'Phone' },
    { id: 'website', title: 'Website' },
    { id: 'address', title: 'Address' },
    { id: 'mapsUrl', title: 'Google Maps URL' },
  ];

  const enrichHeaders = [
    { id: 'email', title: 'Email' },
    { id: 'linkedin', title: 'LinkedIn' },
    { id: 'twitter', title: 'Twitter / X' },
    { id: 'instagram', title: 'Instagram' },
    { id: 'facebook', title: 'Facebook' },
  ];

  const headers = hasEnrichment ? [...baseHeaders, ...enrichHeaders] : baseHeaders;

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const csvWriter = createObjectCsvWriter({
    path: outputPath,
    header: headers,
  });

  const records = leads.map(flattenLead);
  await csvWriter.writeRecords(records);
}

function exportJson(leads: Lead[], outputPath: string): void {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const data = leads.map((lead) => ({
    title: lead.title ?? '',
    rating: lead.rating ?? '',
    reviews: lead.reviews ?? '',
    category: lead.category ?? '',
    phone: lead.phone ?? '',
    website: lead.website ?? '',
    address: lead.address ?? '',
    mapsUrl: lead.mapsUrl ?? '',
    ...(lead.email !== undefined ? { email: lead.email } : {}),
    ...(lead.socials !== undefined ? { socials: lead.socials } : {}),
  }));

  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
}

function cleanOutputDirectory(outputDir: string): void {
  if (fs.existsSync(outputDir)) {
    const files = fs.readdirSync(outputDir);
    for (const file of files) {
      if (file.endsWith('.csv') || file.endsWith('.json')) {
        try {
          fs.unlinkSync(path.join(outputDir, file));
        } catch {
          // Ignore file locks or access errors
        }
      }
    }
  } else {
    fs.mkdirSync(outputDir, { recursive: true });
  }
}

export async function exportLeads(
  leads: Lead[],
  format: 'csv' | 'json',
  query: string
): Promise<string> {
  if (leads.length === 0) {
    throw new Error('No leads to export.');
  }

  const outputDir = path.resolve(process.cwd(), 'output');
  cleanOutputDirectory(outputDir);

  const filename = buildFilename(query, format);
  const outputPath = path.join(outputDir, filename);

  if (format === 'json') {
    exportJson(leads, outputPath);
  } else {
    await exportCsv(leads, outputPath);
  }

  return outputPath;
}
