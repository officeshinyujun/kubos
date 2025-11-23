# DNA Kubos

DNA Kubos is a web-based 3D scene editor built with Next.js, React, and Three.js via the `@react-three/fiber` library. It allows users to create and manipulate 3D scenes, offering a dynamic environment for 3D model interaction and code generation.

## Features

*   **Interactive 3D Editor**: Build and manipulate 3D scenes directly in the browser.
*   **Real-time Rendering**: Utilize `@react-three/fiber` and `@react-three/drei` for efficient and high-performance 3D rendering.
*   **Component-Based Scene Management**: Easily add and configure 3D objects, lights, and cameras.
*   **Code Generation**: Generate React Three Fiber (R3F) and vanilla Three.js code directly from your scene.
*   **Intuitive UI**: A clean and responsive user interface with dedicated sections for project management, tutorials, and the 3D workspace.
*   **State Management**: Powered by Zustand for robust and scalable state handling.

## Technologies Used

*   **Next.js**: React framework for production.
*   **React**: JavaScript library for building user interfaces.
*   **TypeScript**: Strongly typed superset of JavaScript.
*   **@react-three/fiber**: React renderer for Three.js.
*   **@react-three/drei**: A useful collection of helpers and abstractions for `@react-three/fiber`.
*   **Zustand**: A small, fast, and scalable bearbones state-management solution.
*   **SCSS Modules**: For modular and maintainable styling.

## Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

Make sure you have Node.js and npm (or yarn) installed.

*   Node.js (>= 18.x)
*   npm (>= 9.x) or yarn (>= 1.x)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/dna_kubos.git
    cd dna_kubos
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```

### Running the Development Server

To run the application in development mode:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The application will hot-reload as you make changes.

## Project Structure

*   `app/`: Contains Next.js pages and routing.
*   `components/`: Reusable React components.
*   `assets/`: Static assets like images.
*   `constants/`: Constant values (colors, fonts, spacing).
*   `hooks/`: Custom React hooks.
*   `stores/`: Zustand store definitions for state management.
*   `types/`: TypeScript type definitions.
*   `utils/`: Utility functions (e.g., code generation).

## Contributing

Contributions are welcome! Please feel free to open issues or submit pull requests.

## License

[Specify your license here, e.g., MIT License]