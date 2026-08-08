import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

class SupabaseDBAdapter {
  constructor() {
    this.client = supabase;
  }

  isAvailable() {
    return !!this.client;
  }

  async getAll(table) {
    if (!this.client) return [];
    const { data, error } = await this.client.from(table).select('*');
    if (error) {
      console.error(`Supabase getAll(${table}) error:`, error.message);
      return [];
    }
    return Array.isArray(data) ? data : [];
  }

  async getById(table, id) {
    if (!this.client) return null;
    const { data, error } = await this.client.from(table).select('*').eq('id', id).single();
    if (error) {
      if (error.code !== 'PGRST116') console.error(`Supabase getById(${table}, ${id}) error:`, error.message);
      return null;
    }
    return data;
  }

  async getWhere(table, conditions) {
    if (!this.client) return [];
    let query = this.client.from(table).select('*');
    for (const [key, val] of Object.entries(conditions)) {
      query = query.eq(key, val);
    }
    const { data, error } = await query;
    if (error) {
      console.error(`Supabase getWhere(${table}) error:`, error.message);
      return [];
    }
    return Array.isArray(data) ? data : [];
  }

  async insert(table, row) {
    if (!this.client) return null;
    const dataToInsert = { ...row };
    delete dataToInsert.id;
    const { data, error } = await this.client.from(table).insert([dataToInsert]).select().single();
    if (error) {
      console.error(`Supabase insert(${table}) error:`, error.message);
      throw new Error(error.message);
    }
    return data;
  }

  async update(table, id, updates) {
    if (!this.client) return null;
    const { data, error } = await this.client.from(table).update(updates).eq('id', id).select().single();
    if (error) {
      console.error(`Supabase update(${table}, ${id}) error:`, error.message);
      throw new Error(error.message);
    }
    return data;
  }

  async delete(table, id) {
    if (!this.client) return false;
    const { error } = await this.client.from(table).delete().eq('id', id);
    if (error) {
      console.error(`Supabase delete(${table}, ${id}) error:`, error.message);
      throw new Error(error.message);
    }
    return true;
  }

  async createAuthUser(email, password, nama, phone) {
    if (!this.client) return null;
    try {
      const formattedPhone = phone ? (phone.startsWith('+') ? phone : '+62' + phone.replace(/^0/, '')) : undefined;
      const { data, error } = await this.client.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { nama, phone: formattedPhone }
      });
      if (error) {
        console.error('Supabase Auth createUser error:', error.message);
      } else {
        console.log('✅ Registered user in Supabase Auth:', email);
      }
      return data?.user || null;
    } catch (e) {
      console.error('Supabase Auth Exception:', e.message);
      return null;
    }
  }

  async uploadFile(bucket, filePath, fileBuffer, mimeType) {
    if (!this.client) return null;
    try {
      const { data, error } = await this.client.storage
        .from(bucket)
        .upload(filePath, fileBuffer, {
          contentType: mimeType,
          upsert: true
        });
      
      if (error) {
        console.error('Supabase upload error:', error.message);
        throw new Error(error.message);
      }
      
      const { data: publicUrlData } = this.client.storage
        .from(bucket)
        .getPublicUrl(filePath);
        
      return publicUrlData.publicUrl;
    } catch (e) {
      console.error('Supabase upload Exception:', e.message);
      throw e;
    }
  }
}

export default new SupabaseDBAdapter();
