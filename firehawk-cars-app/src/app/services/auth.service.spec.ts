import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let mockAuth: any;
  let mockRouter: any;

  beforeEach(() => {
    mockAuth = {
      currentUser: null,
      signOut: jasmine.createSpy('signOut').and.returnValue(Promise.resolve()),
    };

    mockRouter = jasmine.createSpyObj(['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Auth, useValue: mockAuth },
        { provide: Router, useValue: mockRouter },
        {
          provide: 'angularfire2.app.FirebaseApp',
          useValue: {},
        },
      ],
    });
    spyOn(localStorage, 'getItem').and.callThrough();
    spyOn(localStorage, 'setItem').and.callThrough();
    spyOn(localStorage, 'removeItem').and.callThrough();
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return token from localStorage if memory token is null', () => {
    localStorage.setItem('auth_token', 'mock-token-123');
    const token = service.getToken();
    expect(token).toBe('mock-token-123');
  });

  it('should clear storage and navigate to login on logout', async () => {
    await service.logout();
    expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });
});
