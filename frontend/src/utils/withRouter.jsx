import { useNavigate } from 'react-router-dom';

export function withRouter(Component) {
  return function WrappedComponent(props) {
    const navigate = useNavigate();

    // Create a mock history object for pushing
    const history = {
      push: (path) => navigate(path),
      replace: (path) => navigate(path, { replace: true })
    };

    return <Component {...props} history={history} />;
  };
}