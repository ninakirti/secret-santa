import { Component, OnInit, OnDestroy } from '@angular/core';
import { SupabaseService } from './services/supabase.service';
import { Participant } from './interfaces/participant.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit { //, OnDestroy {

  username: string = '';
  isLoggedIn = false;
  participants: Participant[] = []; // For the dropdown
  selectedParticipant: Participant | null = null; // Selected name from the dropdown
  private participantSubscription: any;
  loggedInParticipant: Participant | null = null;

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit() {
    this.fetchLoginParticipants();
    //this.fetchAvailableParticipants();
    this.subscribeToParticipantChanges();
  }

  async fetchLoggedInParticipant() {
    const { data, error } = await this.supabaseService.getParticipantByName(this.username);
    if (error) {
      console.error('Error fetching logged-in participant:', error);
    } else {
      this.loggedInParticipant = data;

      // Only check for selected_santa if loggedInParticipant is not null
      if (this.loggedInParticipant && this.loggedInParticipant.selected_santa !== null) {
        const { data: selectedSantaData, error: santaError } =
          await this.supabaseService.getParticipantById(this.loggedInParticipant.selected_santa);

        if (santaError) {
          console.error('Error fetching selected Santa:', santaError);
        } else {
          this.selectedParticipant = selectedSantaData; // Store the Santa's details
        }
      }
    }
  }


  async fetchLoginParticipants() {
    console.log('Fetching all participants for login...');
    const { data, error } = await this.supabaseService.getAllParticipants();
    if (error) {
      console.error('Error fetching participants for login:', error);
    } else {
      this.participants = data ?? []; // Use all participants for login
    }
  }

  async login() {
    console.log('Logging in as:', this.username);
    const success = await this.supabaseService.login(this.username);
    this.isLoggedIn = success;

    if (success) {
      console.log('Login successful!');
      await this.fetchLoggedInParticipant();
      this.fetchAvailableParticipants(); // Fetch only available participants
      this.subscribeToParticipantChanges();
    } else {
      alert('Login failed: user not found.');
    }
  }

  async fetchAvailableParticipants() {
    const { data, error } = await this.supabaseService.getAvailableParticipants();
    if (error) {
      console.error('Error fetching participants:', error);
    } else {
      this.participants = data ?? [];
    }
  }

  async chooseParticipant(participant: Participant) {
    if (!this.loggedInParticipant) {
      console.error('No logged-in participant found');
      return;
    }

    const loggedInUserId = this.loggedInParticipant.id;
    const selectedSantaId = participant.id;

    // Update the logged-in user's selected_santa field
    const { error: updateSantaError } = await this.supabaseService.updateSelectedSanta(loggedInUserId, selectedSantaId);
    if (updateSantaError) {
      console.error('Error updating selected_santa:', updateSantaError);
      alert('Failed to select participant');
      return;
    }

    // Update the chosen participant's chosen field to true
    const { error: updateChosenError } = await this.supabaseService.updateChosenStatus(selectedSantaId, true);
    if (updateChosenError) {
      console.error('Error updating chosen status:', updateChosenError);
      alert('Failed to select participant');
      return;
    }

    // Update the UI
    this.selectedParticipant = participant;
    this.fetchAvailableParticipants(); // Refresh participant list
    alert(`You selected ${participant.name} as your Secret Santa!`);
  }


  subscribeToParticipantChanges() {
    this.participantSubscription = this.supabaseService.subscribeToParticipants(payload => {
      console.log('Change received!', payload);
      this.fetchAvailableParticipants(); // Re-fetch participants on changes
    });
  }

  ngOnDestroy() {
    if (this.participantSubscription) {
      this.supabaseService.unsubscribe(this.participantSubscription);
    }
  }

}
