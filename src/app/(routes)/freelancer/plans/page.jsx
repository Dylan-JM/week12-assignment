export default function PricingPage() {
  const plans = [
    {
      frontendName: "Free/Starter",
      name: "free",
      price: "Free!",
      features: {
        ProfileListing: true,
        JobApplications: "1 Per Month",
        Messaging: true,
        "Client Requests": true,
        Analytics: false,
        "Portfolio Upload": false,
      },
    },
    {
      frontendName: "Basic",
      name: "basic",
      price: "£19.99/Month",
      features: {
        ProfileListing: true,
        JobApplications: "10 Per Month",
        Messaging: true,
        "Client Requests": true,
        Analytics: true,
        "Portfolio Upload": true,
      },
    },
    {
      frontendName: "Pro",
      name: "Pro",
      price: "£49.99/Month",
      features: {
        ProfileListing: true,
        JobApplications: "Unlimited",
        Messaging: true,
        "Client Requests": true,
        Analytics: true,
        "Portfolio Upload": true,
      },
    },
  ];

  const featureList = [
    "ProfileListing",
    "JobApplications",
    "Messaging",
    "Client Requests",
    "Analytics",
    "Portfolio Upload",
  ];

  return (
    <>
      <div className="pricing-page">
        <h1 className="plans-title">Trakr Pricing Plans</h1>

        <div className="plans-table-container">
          <table className="plans-table">
            <thead>
              <tr>
                <th className="plans-table-features-title">Features</th>
                {plans.map((plan) => (
                  <th key={plan.name}>
                    <div className="plan-header">
                      <h2>{plan.frontendName}</h2>
                      <p className="price">{plan.price}</p>
                      <button className="choose-plan-btn">Choose Plan</button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {featureList.map((feature) => (
                <tr key={feature}>
                  <td className="feature-name">
                    {feature.replace(/([A-Z])/g, " $1").trim()}
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.name + feature}>
                      {typeof plan.features[feature] === "boolean"
                        ? plan.features[feature]
                          ? "✔"
                          : "✖"
                        : plan.features[feature]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
