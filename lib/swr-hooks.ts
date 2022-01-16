import useSWR from 'swr';
import axios from 'axios';

export const initAxios = (showToast) =>
  axios.interceptors.response.use(
    function (response) {
      // 对响应数据做点什么
      console.log('axios response', response);
      if (response.status === 200 && response?.data?.code !== 0) {
        showToast({
          severity: 'error',
          message: response.data.msg,
        });
      }
      return response;
    },
    function (error) {
      showToast({
        severity: 'error',
        message: error.message,
      });
      // toast.notify(error.message, { title: 'Server Error Response', type: 'error', duration: 2.5 });
      return Promise.reject(error);
    },
  );

function fetcher(url: string) {
  return window.fetch(url).then((res) => res.json());
}

export function useEntries() {
  const { data, error } = useSWR(`/api/get-entries`, fetcher);

  return {
    entries: data,
    isLoading: !error && !data,
    isError: error,
  };
}

export function useEntry(id: string) {
  return useSWR(`/api/get-entry?id=${id}`, fetcher);
}

const axiosWithBody = (body: any) => (url: string) => axios.post(url, body);

export function useChannels(space_id: number) {
  return useSWR(`/api/users/channels?space_id=${space_id}`, axiosWithBody({ space_id }));
}

export function useChannelInfo(channel_id: number) {
  return useSWR(`/api/channels/info?channel_id=${channel_id}`, axiosWithBody({ channel_id }));
}

export function useChannelUsers(channel_id: number) {
  return useSWR(`/api/channels/users?channel_id=${channel_id}`, axiosWithBody({ channel_id }));
}

export function useMessages(channel_id: number) {
  return useSWR(`/api/messages/list?channel_id=${channel_id}`, axiosWithBody({ channel_id }));
}
