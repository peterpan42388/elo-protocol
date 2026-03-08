import { useEffect, useState } from "react";
import { useAuth } from "../../state/auth";

type AuthSettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AuthSettingsModal({ isOpen, onClose }: AuthSettingsModalProps) {
  const { auth, updateAuth } = useAuth();
  const [apiBaseUrl, setApiBaseUrl] = useState(auth.apiBaseUrl);
  const [bearerToken, setBearerToken] = useState(auth.bearerToken);
  const [hmacSecret, setHmacSecret] = useState(auth.hmacSecret);
  const [defaultConsumerAgentId, setDefaultConsumerAgentId] = useState(auth.defaultConsumerAgentId);

  useEffect(() => {
    if (!isOpen) return;
    setApiBaseUrl(auth.apiBaseUrl);
    setBearerToken(auth.bearerToken);
    setHmacSecret(auth.hmacSecret);
    setDefaultConsumerAgentId(auth.defaultConsumerAgentId);
  }, [isOpen, auth]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="API settings">
      <div className="modal-card">
        <header className="modal-header">
          <h2>API Settings</h2>
          <button className="button button-ghost" onClick={onClose} type="button">
            Close
          </button>
        </header>

        <div className="modal-body">
          <label className="label">
            API Base URL
            <input
              className="input code"
              value={apiBaseUrl}
              onChange={(event) => setApiBaseUrl(event.target.value)}
              placeholder="/elo-api"
            />
          </label>

          <label className="label">
            Bearer Token (optional)
            <input
              className="input code"
              value={bearerToken}
              onChange={(event) => setBearerToken(event.target.value)}
              placeholder="token"
            />
          </label>

          <label className="label">
            HMAC Secret (optional)
            <input
              className="input code"
              value={hmacSecret}
              onChange={(event) => setHmacSecret(event.target.value)}
              placeholder="secret"
            />
          </label>

          <label className="label">
            Default Consumer Agent ID
            <input
              className="input code"
              value={defaultConsumerAgentId}
              onChange={(event) => setDefaultConsumerAgentId(event.target.value)}
              placeholder="agentConsumer"
            />
          </label>
        </div>

        <footer className="modal-footer">
          <button
            className="button button-secondary"
            type="button"
            onClick={() => {
              updateAuth({
                apiBaseUrl: "/elo-api",
                bearerToken: "",
                hmacSecret: "",
                defaultConsumerAgentId: "",
              });
              onClose();
            }}
          >
            Reset
          </button>

          <button
            className="button button-primary"
            type="button"
            onClick={() => {
              updateAuth({
                apiBaseUrl: apiBaseUrl.trim() || "/elo-api",
                bearerToken: bearerToken.trim(),
                hmacSecret: hmacSecret.trim(),
                defaultConsumerAgentId: defaultConsumerAgentId.trim(),
              });
              onClose();
            }}
          >
            Save
          </button>
        </footer>
      </div>
    </div>
  );
}
