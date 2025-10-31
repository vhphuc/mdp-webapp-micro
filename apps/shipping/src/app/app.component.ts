import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="shipping-container">
      <header class="shipping-header">
        <h1>Shipping Operations</h1>
        <p>Manage shipping and logistics operations</p>
      </header>
      
      <main class="shipping-content">
        <div class="shipping-card">
          <h2>Welcome to Shipping</h2>
          <p>This is the Shipping application for MDP Mobile.</p>
          <p>Features coming soon...</p>
        </div>
      </main>
      
      <footer class="shipping-footer">
        <p>&copy; 2025 Monster Digital Productions - Shipping Module</p>
      </footer>
    </div>
  `,
  styles: [`
    .shipping-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
      color: white;
    }

    .shipping-header {
      text-align: center;
      padding: 2rem;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
    }

    .shipping-header h1 {
      margin: 0 0 0.5rem 0;
      font-size: 2.5rem;
      font-weight: 300;
    }

    .shipping-header p {
      margin: 0;
      font-size: 1.1rem;
      opacity: 0.9;
    }

    .shipping-content {
      flex: 1;
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }

    .shipping-card {
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      padding: 2rem;
      text-align: center;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .shipping-card h2 {
      margin: 0 0 1rem 0;
      font-size: 1.8rem;
      font-weight: 500;
    }

    .shipping-card p {
      margin: 0 0 1rem 0;
      opacity: 0.9;
      line-height: 1.6;
    }

    .shipping-footer {
      text-align: center;
      padding: 1rem;
      background: rgba(0, 0, 0, 0.2);
    }

    .shipping-footer p {
      margin: 0;
      opacity: 0.8;
      font-size: 0.9rem;
    }
  `]
})
export class AppComponent {
  title = 'Shipping Application';
}