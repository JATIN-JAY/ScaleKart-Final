import { Link } from "react-router-dom";
import Button from "../../components/common/Button";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-primary-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Page not found</h2>
        <p className="text-gray-600 mb-6">
          The page you are looking for doesn’t exist or has been moved.
        </p>

        <Link to="/">
          <Button>Go back home</Button>
        </Link>
      </div>
    </div>
  );
}
