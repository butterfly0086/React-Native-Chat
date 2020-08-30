import { useEffect, useState, useContext } from 'react';
import { MAX_QUERY_CHANNELS_LIMIT } from '../utils';
import { ChatContext } from '../../../context';

const wait = (ms) => {
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export const usePaginatedChannels = (filters = {}, options = {}, sort = {}) => {
  const { storage, client } = useContext(ChatContext);
  const [active, setActive] = useState(false);
  const [channels, setChannels] = useState([]);
  const [error, setError] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [loadingNextPage, setLoadingNextPage] = useState(false);
  const [offset, setOffset] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const queryChannels = async (queryType = '', retryCount = 0) => {
    if (loadingChannels || loadingNextPage || refreshing) return;

    if (queryType === 'reload') {
      setChannels([]);
      setLoadingChannels(true);
    } else if (queryType === 'refresh') {
      setRefreshing(true);
    } else if (!queryType) {
      setLoadingNextPage(true);
    }

    const newOptions = {
      limit: options?.limit ?? MAX_QUERY_CHANNELS_LIMIT,
      offset: queryType === 'reload' ? 0 : offset,
      ...options,
    };

    try {
      const channelQueryResponse = await client.queryChannels(
        filters,
        sort,
        newOptions,
      );

      let newChannels;
      if (queryType === 'reload') {
        newChannels = channelQueryResponse;
      } else {
        newChannels = [...channels, ...channelQueryResponse];
      }

      setChannels(newChannels);
      setHasNextPage(channelQueryResponse.length >= newOptions.limit);
      setOffset(newChannels.length);

      storage.storeChannels(filters, sort, newChannels, queryType === 'reload');
    } catch (e) {
      setLoadingChannels(false);
      setLoadingNextPage(false);
      setRefreshing(false);
      await wait(2000);

      if (retryCount === 3) {
        console.warn(e);
        return setError(true);
      }

      return queryChannels(queryType, retryCount + 1);
    }

    setLoadingChannels(false);
    setLoadingNextPage(false);
    setRefreshing(false);
    setActive(true);
  };

  const loadNextPage = () => {
    if (hasNextPage) return queryChannels();
  };
  const refreshList = () => queryChannels('refresh');
  const reloadList = () => queryChannels('reload');

  useEffect(() => {
    if (client) {
      reloadList();
    }
  }, [filters]);

  return {
    channels,
    hasNextPage,
    loadNextPage,
    refreshList,
    reloadList,
    setChannels,
    active,
    status: {
      error,
      loadingChannels,
      loadingNextPage,
      refreshing,
    },
  };
};
