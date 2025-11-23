
import {Component} from "react";
import { Link } from "react-router-dom";
import "./App.css";

class StatsPage extends Component {
  state = {
    link: null,
    loading: true,
    error: "",
  };

  API_BASE_URL = "https://shortlinkcreater.onrender.com"; 

  componentDidMount() {
    this.loadStats();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.code !== this.props.code) {
      this.loadStats();
    }
  }

  loadStats = async () => {
    const { code } = this.props;

    if (!code) {
      this.setState({
        loading: false,
        error: "No code provided",
      });
      return;
    }

    try {
      this.setState({ loading: true, error: "" });

      const res = await fetch(`${this.API_BASE_URL}/api/apilinks/${code}`);
      const text = await res.text();

      if (res.status === 404) {
        this.setState({ error: "Link not found", link: null });
        return;
      }

      if (!res.ok) {
        throw new Error(text || "Failed to fetch stats");
      }

      const data = JSON.parse(text);

      this.setState({
        link: data,
        error: "",
        loading: false,
      });
    } catch (err) {
      console.error("fetchLinkStats error:", err);
      this.setState({
        error: err.message || "Failed to fetch stats",
        loading: false,
      });
    
    }
  };

  render() {
    const { code } = this.props;
    const { link, loading, error } = this.state;

    return (
      <div className="container">
        <header className="header">
          <h1 className="title1">Stats for: {code}</h1>
          <p className="title2">
            View click details and original URL for this short code
          </p>
        </header>

        <div>
          <div className="card">
            <div>
              <Link to="/">
                ← Back to Dashboard
              </Link>
            </div>

            {loading && (
              <p>Loading stats for {code}...</p>
            )}
            {!loading && error && (
              <p className="alert alert-error">{error}</p>
            )}

           
            {!loading && !error && !link && (
              <p>No data available for this code.</p>
            )}

           
            {!loading && !error && link && (
              <div>
              
                <div>
                  <h2>Link Info</h2>

                  <p>
                    <strong>Short Code:</strong>{" "}
                    <span>{link.code}</span>
                  </p>

                  <p>
                    <strong>Short URL:</strong>{" "}
                    <a
                      href={`${this.API_BASE_URL}/${link.code}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {`${this.API_BASE_URL}/${link.code}`}
                    </a>
                  </p>

                  <p>
                    <strong>Target URL:</strong>{" "}
                    <a
                      href={link.target_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {link.target_url}
                    </a>
                  </p>

                  <p>
                    <strong>Created At:</strong>{" "}
                    {link.created_at
                      ? new Date(link.created_at).toLocaleString()
                      : "Unknown"}
                  </p>
                </div>
                <div>
                  <h2>Stats</h2>

                  <p>
                    <strong>Total Clicks:</strong> {link.total_clicks}
                  </p>

                  <p>
                    <strong>Last Clicked:</strong>{" "}
                    {link.last_clicked_at
                      ? new Date(link.last_clicked_at).toLocaleString()
                      : "Never"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default StatsPage;
