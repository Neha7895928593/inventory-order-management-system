import PanelCard from './PanelCard'

function CustomersTab({ customers, onDelete, loading }) {
  return (
    <div className="view-grid">
      <div className="workspace-summary-grid">
        <PanelCard title="Directory" subtitle="">
          <div className="mini-stats">
            <div>
              <strong>{loading ? '...' : customers.length}</strong>
              <span>Total customers</span>
            </div>
            <div>
              <strong>{loading ? '...' : customers.filter((customer) => customer.email).length}</strong>
              <span>Email captured</span>
            </div>
            <div>
              <strong>{loading ? '...' : customers.filter((customer) => customer.phone_number).length}</strong>
              <span>Phone captured</span>
            </div>
          </div>
        </PanelCard>

        <PanelCard title="Coverage" subtitle="">
          <div className="mini-stats">
            <div>
              <strong>{loading ? '...' : customers.filter((customer) => customer.email && customer.phone_number).length}</strong>
              <span>Complete records</span>
            </div>
            <div>
              <strong>{loading ? '...' : customers.filter((customer) => customer.email && !customer.phone_number).length}</strong>
              <span>Missing phone</span>
            </div>
            <div>
              <strong>{loading ? '...' : customers.filter((customer) => !customer.email || !customer.phone_number).length}</strong>
              <span>Needs review</span>
            </div>
          </div>
        </PanelCard>
      </div>

      <PanelCard title="Customer Table" subtitle="">
        <div className="table-shell">
          <table>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {loading
                ? [...Array(3)].map((_, index) => (
                    <tr key={`loading-customer-${index}`}>
                      <td colSpan="4">
                        <div className="skeleton-line skeleton-row" />
                      </td>
                    </tr>
                  ))
                : customers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.full_name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phone_number}</td>
                  <td className="table-button-cell">
                    <button type="button" className="button-danger" onClick={() => onDelete(customer.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && !customers.length ? <p className="empty-state">No customers created yet.</p> : null}
        </div>
      </PanelCard>
    </div>
  )
}

export default CustomersTab
