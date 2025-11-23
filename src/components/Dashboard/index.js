import {Component} from "react";
import { Link } from "react-router-dom";
import "./index.css"

class Dashboard extends Component {
  state = {
    links: [],
    loading: false,
    error: "",
    successMessage: "",
    targetUrl: "",
    Shortcode: "",
    
  };

  API_BASE_URL = "http://localhost:3001"; 
  onChangeCode = (event) => {
    this.setState({ Shortcode: event.target.value });
  }

  onChangeUrl = (event) => {
    this.setState({ targetUrl: event.target.value });
  }
  componentDidMount() {
    this.loadLinks();
  }

  loadLinks = async () => {
    try {
      this.setState({ loading: true, error: "" });

      const res = await fetch(`${this.API_BASE_URL}/api/apilinks`);
      const text = await res.text();

      if (!res.ok) {
        throw new Error(text || "Failed to fetch links");
      }

      const data = JSON.parse(text);

      this.setState({ links: data,loading: false });
    } catch (err) {
      console.error("fetchLinks error:", err);
      this.setState({ error: "Failed to fetch links" });
  
    }
  };

  
  onCreate = async (event) => {
    event.preventDefault();

    const { targetUrl, Shortcode } = this.state;

    if (!targetUrl) {
      this.setState({ error: "Please enter a URL" });
      return;
    }

    try {
      this.setState({ creating: true, error: "", successMessage: "" });

      const res = await fetch(`${this.API_BASE_URL}/api/apilinks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUrl, Shortcode }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (res.status === 409) {
        throw new Error(data.error || "Code already exists");
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to create link");
      }

      this.setState({
        targetUrl: "",
        Shortcode: "",
        successMessage: "Link created successfully!",
        creating: false,
      });

      this.loadLinks();
    } catch (err) {
      this.setState({ error: err.message });
    }
  };

  onDelete = async (code) => {
    try {
      const res = await fetch(
        `${this.API_BASE_URL}/api/apilinks/${code}`,
        { method: "DELETE" }
      );

      if (res.status === 404) {
        alert("Link not found");
        return;
      }

      if (!res.ok) {
        alert("Failed to delete link");
        return;
      }

      this.loadLinks();
    } catch (err) {
      alert("Failed to delete link");
    }
  };

  render() {
    const {links,loading,error,successMessage,targetUrl,Shortcode} = this.state;

    return (
      <div className="maincontainer">
        <header className="header">
          <h1 className="title">Dashboard</h1>
          <p className="subtitle">Create Your Persionalized short links</p>
        </header>

        <div className="container2">
          <div className="card">
            {error && <p className="alert alert-error">{error}</p>}
            {successMessage && (
              <p className="alert alert-success">{successMessage}</p>
            )}
            <div className="form-section">
              <h2>Add New Link</h2>

              <form onSubmit={this.onCreate} className="link-form">
                <div className="form-group">
                  <label className="form-label">Long URL</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="https://example.com"
                    value={targetUrl}
                    onChange={this.onChangeUrl}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Custom Code (optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="6–8 chars"
                    value={Shortcode}
                    onChange={this.onChangeCode}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                >create short url </button>
              </form>
            </div>
            <div className="table-container">
              <h2>Your Links</h2>

              {loading ? (
                <p>Loading...</p>
              ) : links.length === 0 ? (
                <p>No links yet.</p>
              ) : (
                <div className="table-container2">
                  <table className="links-container">
                    <thead>
                      <tr>
                        <th>Short Code</th>
                        <th>URL</th>
                        <th>Clicks</th>
                        <th>Last Clicked</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {links.map((link) => (
                        <tr key={link.id}>
                          <td>
                          <Link to={`/code/${link.code}`} className="code-link">
                            <span className="codecontainer">{link.code}</span>
                          </Link>
                          </td>
                          <td className="link-container" title={link.target_url}>
                            {link.target_url}
                          </td>

                          <td>{link.total_clicks}</td>

                          <td>
                            {link.last_clicked_at
                              ? new Date(
                                  link.last_clicked_at
                                ).toLocaleString()
                              : "Never"}
                          </td>

                          <td>
                            <button
                              className="btn btn-delete"
                              onClick={() => this.onDelete(link.code)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
    </div>
    );
  }
}

export default Dashboard;
