import React, { useState, useEffect } from 'react';
// Define the shape of the Tab and GroupChat data
interface Tab {
  id: string;
  name: string;
  chainId: string;
  description: string;
}
interface GroupChat {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  activeOnChain: string;
  members: string;
}
const GroupChatCard: React.FC<GroupChat> = ({ imageUrl, title, description, activeOnChain, members }) => (
  <div style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '8px', width: '300px', margin: '16px' }}>
    <img
      src={imageUrl}
      alt={title}
      style={{ borderRadius: '50%', width: '80px', height: '80px', objectFit: 'cover', margin: 'auto', display: 'block' }}
    />
    <h3 style={{ textAlign: 'center', marginTop: '16px' }}>{title}</h3>
    <p style={{ fontSize: '14px', textAlign: 'center', color: '#666' }}>{description}</p>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
      <span>{activeOnChain} active on-chain</span>
      <span>{members} members</span>
    </div>
  </div>
);
const discover: React.FC = () => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [groupChats, setGroupChats] = useState<GroupChat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const fetchTabs = async () => {
    try {
      // TODO: fetch data for each tab
      const response = await fetch('/api/tabs');
      const data = await response.json();
      setTabs(data);
      if (data.length > 0) {
        setActiveTab(data[0].id); // Set the first tab as active by default
      }
    } catch (error) {
      console.error('Error fetching tabs:', error);
    }
  };
  // Function to fetch group chat data from an API based on the active tab
  const fetchGroupChats = async (tabId: string) => {
    setLoading(true);
    try {
    // TODO: fetch data from graph and fetch NFT metadata
      const response = await fetch(`/api/groupchats?tabId=${tabId}`);
      const data = await response.json();
      setGroupChats(data);
    } catch (error) {
      console.error('Error fetching group chat data:', error);
    } finally {
      setLoading(false);
    }
  };
  // Fetch tabs when the component mounts
  useEffect(() => {
    fetchTabs();
  }, []);
  // Fetch group chat data when the active tab changes
  useEffect(() => {
    if (activeTab) {
      fetchGroupChats(activeTab);
    }
  }, [activeTab]);
  return (
    <div style={{ padding: '32px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', marginBottom: '16px' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 16px',
              border: 'none',
              backgroundColor: activeTab === tab.id ? '#4A7D8A' : '#ddd',
              color: activeTab === tab.id ? '#fff' : '#000',
              cursor: 'pointer',
              borderRadius: '4px',
              marginRight: '8px',
            }}
          >
            {tab.name}
          </button>
        ))}
      </div>
      {tabs.find((tab) => tab.id === activeTab) && (
        <>
          <h1>{tabs.find((tab) => tab.id === activeTab)?.name} Protocol</h1>
          <p>{tabs.find((tab) => tab.id === activeTab)?.description}</p>
        </>
      )}
      <h2>Popular Group Chats</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
          {groupChats.map((groupChat) => (
            <GroupChatCard key={groupChat.id} {...groupChat} />
          ))}
        </div>
      )}
    </div>
  );
};
export default discover;