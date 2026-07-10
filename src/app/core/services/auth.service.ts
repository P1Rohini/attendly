import { Injectable, inject } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  signOut,
  user
} from '@angular/fire/auth';
import { Firestore, doc, docData } from '@angular/fire/firestore';
import { Observable, of, switchMap } from 'rxjs';
import { AppUser } from '../models/app-user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  /** Emits the signed-in Firebase user, or null when signed out. */
  readonly authState$ = user(this.auth);

  /**
   * Emits the app-level profile (with role) for the signed-in user, read from
   * the `users/{uid}` Firestore document. Emits null if signed out or the
   * profile document does not exist yet.
   */
  readonly appUser$: Observable<AppUser | null> = this.authState$.pipe(
    switchMap((firebaseUser) => {
      if (!firebaseUser) {
        return of(null);
      }
      const ref = doc(this.firestore, `users/${firebaseUser.uid}`);
      return docData(ref) as Observable<AppUser | undefined>;
    }),
    switchMap((profile) => of(profile ?? null))
  );

  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }
}
