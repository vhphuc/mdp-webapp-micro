import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: 
    <div class="app-container">
      <header class="app-header">
        <h1>PRINT LEAD Operations</h1>
        <p>Manage print lead production and quality control</p>
      </header>
      
      <main class="app-content">
        <div class="app-card">
          <h2>Welcome to PRINT LEAD</h2>
          <p>This is the PRINT LEAD application for MDP Mobile.</p>
          <p>Features coming soon...</p>
        </div>
      </main>
      
      <footer class="app-footer">
        <p>&copy; 2025 Monster Digital Productions - PRINT LEAD Module</p>
      </footer>
    </div>
  ,
  styles: [
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: linear-gradient(135deg, #607D8B 0%, darken(#607D8B, 20%) 100%);
      color: white;
    }

    .app-header {
      text-align: center;
      padding: 2rem;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
    }

    .app-header h1 {
      margin: 0 0 0.5rem 0;
      font-size: 2.5rem;
      font-weight: 300;
    }

    .app-header p {
      margin: 0;
      font-size: 1.1rem;
      opacity: 0.9;
    }

    .app-content {
      flex: 1;
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }

    .app-card {
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      padding: 2rem;
      text-align: center;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .app-card h2 {
      margin: 0 0 1rem 0;
      font-size: 1.8rem;
      font-weight: 500;
    }

    .app-card p {
      margin: 0 0 1rem 0;
      opacity: 0.9;
      line-height: 1.6;
    }

    .app-footer {
      text-align: center;
      padding: 1rem;
      background: rgba(0, 0, 0, 0.2);
    }

    .app-footer p {
      margin: 0;
      opacity: 0.8;
      font-size: 0.9rem;
    }
  ]
})
export class AppComponent {
  title = 'PRINT LEAD Application';
}
