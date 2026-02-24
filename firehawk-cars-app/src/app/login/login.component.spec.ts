import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

describe('LoginComponent Test - ', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj(['login']);
    mockRouter = jasmine.createSpyObj(['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, FormsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Should navigate to dashboard on successful login', fakeAsync(() => {
    mockAuthService.login.and.returnValue(
      Promise.resolve({ email: 'test@test.com' })
    );
    component.email = 'test@test.com';
    component.password = 'password123';
    component.onLogin();
    tick();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    expect(component.errorMessage).toBe('');
  }));

  it('Should display specific error message for wrong password', fakeAsync(() => {
    const errorResponse = { code: 'auth/wrong-password' };
    mockAuthService.login.and.returnValue(Promise.reject(errorResponse));
    component.onLogin();
    tick();
    expect(component.errorMessage).toBe('Invalid email or password.');
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  }));
});
