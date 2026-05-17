export const handler = async (event) => {
  const { routeKey } = event;

  if (routeKey === 'POST /matches/trigger') {
    // In a real app, this might trigger a manual re-scan
    return {
      statusCode: 202,
      body: JSON.stringify({ message: 'Match scan triggered' }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ matches: [
      { id: 1, name: 'John Doe', score: 0.95, status: 'probable' },
      { id: 2, name: 'Jane Smith', score: 0.82, status: 'possible' }
    ]}),
  };
};
