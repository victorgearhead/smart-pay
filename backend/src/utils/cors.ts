
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
};

export const handleCors = (statusCode: number = 200, body: any = {}) => {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(body)
  };
};
