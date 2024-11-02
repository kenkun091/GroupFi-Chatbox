import fetch from 'node-fetch'; 
import dotenv from 'dotenv';

dotenv.config();

interface TokenContent {
  contract_address: string;
  token_id: string;
}

interface TokenResponse {
  data: {
    content: TokenContent[];
  };
}

interface OwnerResponse {
  data: {
    owners_total: number;
  };
}

/**
 * 获取钱包地址在指定合约中的所有 Token ID
 * @param walletAddress 钱包地址
 * @param contractAddress 合约地址
 * @param apiKey API 密钥
 * @returns 返回 Token ID 数组
 */
async function getTokenIds(
  walletAddress: string, 
  contractAddress: string, 
  apiKey: string
): Promise<string[]> {
  const url = `https://restapi.nftscan.com/api/v2/account/mint/${walletAddress}?erc_type=erc721&show_attribute=false&contract_address=${contractAddress}`;

  const options = {
    headers: {
      'X-API-KEY': apiKey,
    },
  };

  try {
    const response = await fetch(url, options);
    const data: TokenResponse = await response.json();

    const tokenIds = data.data.content
      .filter(content => content.contract_address === contractAddress)
      .map(content => content.token_id);

    return tokenIds;
  } catch (error) {
    console.error('Error:', error);
    return