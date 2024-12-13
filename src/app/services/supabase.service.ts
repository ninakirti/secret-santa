import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';
import { Participant } from '../interfaces/participant.model';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  // Auth login by username

  async login(username: string): Promise<boolean> {
    try {
      const { data, error, status } = await this.supabase
        .from('participants')
        .select('*')
        .eq('name', username);
        // .single(); // Ensure single() only returns one match

      // Handle specific cases with error messages
      if (status === 406) {
        console.error("406 Not Acceptable - No matching user or multiple users found with the same name.");
        return false;
      }

      if (error) {
        console.error("Error during login:", error.message);
        return false;
      }

      if (!data) {
        console.warn("No user found for username:", username);
        return false;
      }

      //console.log("Login successful for user:", data.name);
      return true;
    } catch (err) {
      console.error("Unexpected error during login:", err);
      return false;
    }
  }

  async getAllParticipants(): Promise<{ data: Participant[] | null; error: any }> {
    const { data, error } = await this.supabase
      .from('participants')
      .select('*'); // Adjust '*' to select specific columns if needed

    return { data: data as Participant[] | null, error };
  }


  async getParticipantNames(): Promise<{ data: string[] | null; error: any }> {
    const { data, error } = await this.supabase
      .from('participants')
      .select('name'); // Fetch only the 'name' column

    return { data: data?.map((row: any) => row.name) ?? null, error };
  }

  // Fetch available participants who have not been chosen
  async getAvailableParticipants(): Promise<{ data: Participant[] | null, error: any }> {
    const { data, error } = await this.supabase
      .from('participants')
      .select('*')
      .eq('chosen', false);
    return { data: data as Participant[] | null, error };
  }

  // Real-time subscription to the `participants` table
  // tal vez no sea necesario
  subscribeToParticipants(callback: (payload: any) => void) {
    const channel = this.supabase
      .channel('participants')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'participants' },
        callback
      )
      .subscribe();

    return channel;
  }

  // Method to mark a participant as chosen
  async chooseParticipant(participantId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('participants')
      .update({ chosen: true })
      .eq('id', participantId);
    return !error;
  }

  async updateSelectedSanta(userId: number, selectedSantaId: number): Promise<{ error: any }> {
    const { error } = await this.supabase
      .from('participants')
      .update({ selected_santa: selectedSantaId })
      .eq('id', userId);
    return { error };
  }

  async updateChosenStatus(participantId: number, chosen: boolean): Promise<{ error: any }> {
    const { error } = await this.supabase
      .from('participants')
      .update({ chosen: chosen })
      .eq('id', participantId);
    return { error };
  }

  async getParticipantByName(name: string): Promise<{ data: Participant | null; error: any }> {
    const { data, error } = await this.supabase
      .from('participants')
      .select('*')
      .eq('name', name)
      .single();
    return { data: data as Participant | null, error };
  }

  /*
  // Mark a participant as chosen
  async chooseParticipant(participantId: string) {
    const { error } = await this.supabase
      .from('participants')
      .update({ chosen: true })
      .eq('id', participantId);
    return !error;
  }
    */

  unsubscribe(channel: any) {
    this.supabase.removeChannel(channel);
  }

}

