import {Component, type ReactNode} from 'react';

export default class LoadBoundary extends Component<{message: string; children: ReactNode}> {
  state = {failed: false};

  static getDerivedStateFromError() {
    return {failed: true};
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return <div className="storage-error">
      <p role="alert">{this.props.message} Check your connection and reload this tab to try again.</p>
      <button type="button" className="button-secondary" onClick={() => window.location.reload()}>Reload</button>
    </div>;
  }
}
