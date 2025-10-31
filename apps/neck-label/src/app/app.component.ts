import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="neck-label-container">
      <header class="neck-label-header">
        <h1>Neck Label Operations</h1>
        <p>Manage neck label production and quality control</p>
      </header>
      
      <main class="neck-label-content">
        <div class="neck-label-card">
          <h2>Welcome to Neck Label</h2>
          <p>This is the Neck Label application for MDP Mobile.</p>
          <p>Features coming soon...</p>
        </div>
      </main>
      
      <footer class="neck-label-footer">
        <p>&copy; 2025 Monster Digital Productions - Neck Label Module</p>
      </footer>
    </div>
  `,
  styles: [`
    .neck-label-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
      color: white;
    }

    .neck-label-header {
      text-align: center;
      padding: 2rem;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
    }

    .neck-label-header h1 {
      margin: 0 0 0.5rem 0;
      font-size: 2.5rem;
      font-weight: 300;
    }

    .neck-label-header p {
      margin: 0;
      font-size: 1.1rem;
      opacity: 0.9;
    }

    .neck-label-content {
      flex: 1;
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }

    .neck-label-card {
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      padding: 2rem;
      text-align: center;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .neck-label-card h2 {
      margin: 0 0 1rem 0;
      font-size: 1.8rem;
      font-weight: 500;
    }

    .neck-label-card p {
      margin: 0 0 1rem 0;
      opacity: 0.9;
      line-height: 1.6;
    }

    .neck-label-footer {
      text-align: center;
      padding: 1rem;
      background: rgba(0, 0, 0, 0.2);
    }

    .neck-label-footer p {
      margin: 0;
      opacity: 0.8;
      font-size: 0.9rem;
    }
  `]
})
export class AppComponent {
  title = 'Neck Label Application';
}