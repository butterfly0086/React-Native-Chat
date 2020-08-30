/* eslint-disable no-underscore-dangle */
import {
  convertChannelToStorable,
  convertMessageToStorable,
  convertUserToStorable,
  convertMemberToStorable,
} from './mappers';
import {
  getQueryKey,
  getChannelKey,
  getChannelMessagesKey,
  getChannelReadKey,
  getChannelMembersKey,
} from './keys';

const VALID_CHANNELS_SORT_KEYS = [
  'last_message_at',
  'updated_at',
  'created_at',
];

/**
 * Local storage interface based on AsyncStorage
 *
 * For user with id - U1234 data is stored in following keys:
 *
 * 1. `getstream:chat:U1234@query:{stringified_qoery}` - List of channel ids for stringified_query
 * 2. `getstream:chat:U1234@channel:{channel_id}` - Channel object
 * 3. `getstream:chat:U1234@channel:{channel_id}:messages` - Messages for channel with id - channel_id
 * 4. `getstream:chat:U1234@channel:{channel_id}:members` - Members for channel with id - channel_id
 * 5. `getstream:chat:U1234@channel:{channel_id}:reads` - Read states for channel with id - channel_id
 * 6. `getstream:chat:U1234@user:{user_id}` - User object for user with id - user_id
 * 7. `getstream:chat:U1234@config:{type}` - Channel config of channel type - type
 *
 * All the getters/generators for keys are defined in `./keys.js`.
 */
export class AsyncLocalStorage {
  constructor(AsyncStorage, userId) {
    this.asyncStorage = AsyncStorage;
    this.userId = userId;
    this.logger = () => {};
  }

  setLogger(logger) {
    this.logger = logger;
  }

  //
  // ==========================================================================
  // ==========================================================================
  // Methods to access AsyncStorage.
  // ==========================================================================
  // ==========================================================================
  //

  /**
   *
   * @param {*} key
   * @param {*} defaultValue
   */
  async getItem(key, defaultValue) {
    const strValue = await this.asyncStorage.getItem(key);

    if (!strValue) return defaultValue;

    return JSON.parse(strValue);
  }

  /**
   *
   * @param {*} key
   */
  async setItem(key, value) {
    return await this.asyncStorage.setItem(key, JSON.stringify(value));
  }

  /**
   *
   * @param {*} storables
   */
  async multiSet(storables) {
    const storablesArray = [];

    for (const key in storables) {
      storablesArray.push([key, JSON.stringify(storables[key])]);
    }

    return await this.asyncStorage.multiSet(storablesArray);
  }

  async multiGet(keys) {
    const items = await this.asyncStorage.multiGet(keys);
    const flattenedItems = {};
    items.forEach((kuPair) => {
      flattenedItems[kuPair[0]] = JSON.parse(kuPair[1]);
    });

    return flattenedItems;
  }

  /**
   * Get all the stream storage keys
   */
  async getAllKeys() {
    const allKeys = await this.asyncStorage.getAllKeys();
    if (!allKeys) return [];

    return allKeys.filter(
      (k) => k.indexOf(`getstream:chat:${this.userId}`) === 0,
    );
  }

  /**
   * Deletes all stream storage keys
   */
  async deleteAll() {
    const streamKeys = await this.getAllKeys();

    await this.asyncStorage.multiRemove(streamKeys);
  }

  // Nothing to close here.
  close() {}

  //
  // ==========================================================================
  // ==========================================================================
  //  Methods exposed for functionality of offline storage.
  // ==========================================================================
  // ==========================================================================
  //

  /**
   * Function takes the array of new channels for a query to store and saves it in asyncStorage.
   *
   * @param {*} query
   * @param {*} channels
   * @param {*} resync
   */
  async storeChannels(query, channels, resync) {
    const channelIds = channels.map((c) => getChannelKey(this.userId, c.id));

    const storables = {};
    channels.forEach(
      async (c) => await convertChannelToStorable(c, storables, this.userId),
    );

    if (resync) {
      storables[getQueryKey(this.userId, query)] = channelIds;
    } else {
      const existingChannelIds = await this.getItem(
        getQueryKey(this.userId, query),
        [],
      );

      storables[getQueryKey(this.userId, query)] = existingChannelIds.concat(
        channelIds,
      );
    }
    await this.multiSet(storables);
  }

  /**
   *
   * @param {*} query
   */
  async queryChannels(query, sort, offset, limit) {
    const channelIds = await this.getChannelIdsForQuery(query);
    if (!channelIds) return [];

    let channels = await this.getChannels(channelIds);
    const sortKeys = Object.keys(sort);

    channels.sort((a, b) => {
      let answer = 0;
      sortKeys.forEach((sortKey) => {
        if (VALID_CHANNELS_SORT_KEYS.indexOf(sortKey) === -1) {
          return;
        }

        answer =
          answer ||
          (sort[sortKey] === -1
            ? new Date(b[sortKey]) - new Date(a[sortKey])
            : new Date(a[sortKey]) - new Date(b[sortKey]));
      });

      return answer;
    });
    channels = channels.slice(offset, offset + limit);
    const fChannels = await this.enrichChannels(channels);
    console.r.log(offset, offset + limit, channels, fChannels);

    return fChannels;
  }

  /**
   * This is a bit of a monolithic function.
   */
  enrichChannels = async (channels) => {
    const keysToRetrieve = [];
    channels.forEach((c) => {
      keysToRetrieve.push(c.members, c.messages, c.read);
      if (keysToRetrieve.indexOf(c.config) === -1)
        keysToRetrieve.push(c.config);
    });

    const state = await this.multiGet(keysToRetrieve);

    let usersToRetrive = [];
    const storedChannels = channels.map((c) => ({
      ...c,
      messages: state[c.messages],
      members: state[c.members],
      read: state[c.read],
      config: state[c.config],
    }));

    storedChannels.forEach((c) => {
      c.members.forEach((m) => usersToRetrive.push(m.user));
      c.messages.forEach((m) => {
        m.mentioned_users.forEach((u) => usersToRetrive.push(u));
        m.latest_reactions.forEach((r) => usersToRetrive.push(r.user));
        usersToRetrive.push(m.user);
      });
    });

    usersToRetrive = usersToRetrive.filter(
      (item, index) => usersToRetrive.indexOf(item) === index,
    );

    const users = await this.multiGet(usersToRetrive);

    const finalChannels = storedChannels.map((c) => {
      const channel = { ...c };
      channel.members = c.members.map((m) => {
        const member = m;
        member.user = users[member.user];
        return member;
      });

      for (const userId in channel.read) {
        channel.read[userId].user = users[channel.read[userId].user];
        channel.read[userId].last_read = new Date(
          channel.read[userId].last_read,
        );
      }
      channel.read = Object.values(channel.read);
      const messages = c.messages
        .sort((a, b) =>
          new Date(a.created_at) > new Date(b.created_at) ? -1 : 1,
        )
        .slice(0, 100);
      channel.messages = messages.map((m) => {
        const message = { ...m };
        message.user = users[message.user];
        message.mentioned_users = m.mentioned_users.map((u) => users[u]);
        message.latest_reactions = m.latest_reactions.map((r) => {
          const reaction = r;
          reaction.user = users[r.user];

          return reaction;
        });

        message.own_reactions = m.own_reactions.map((r) => {
          const reaction = r;
          reaction.user = users[r.user];

          return reaction;
        });

        return message;
      });

      return channel;
    });

    return finalChannels;
  };

  async updateChannelData(channelId, data) {
    const channel = await this.getChannel(channelId);
    const { members, ...customData } = data;
    channel.data = customData;

    channel.created_at = data.created_at;
    channel.updated_at = data.updated_at;
    channel.last_message_at = data.last_message_at;

    await this.setItem(getChannelKey(this.userId, channelId), channel);
  }

  /**
   *
   * @param {*} channelId
   * @param {*} message
   */
  async insertMessageForChannel(channelId, message) {
    return await this.insertMessagesForChannel(channelId, [message]);
  }

  /**
   *
   * @param {*} channelId
   * @param {*} messages
   */
  async insertMessagesForChannel(channelId, messages) {
    const storables = {};
    const existingMessages = await this.getItem(
      getChannelMessagesKey(this.userId, channelId),
    );
    const channel = await this.getChannel(channelId);
    const channelKey = getChannelKey(this.userId, channelId);
    let newMessages = messages.map((m) => {
      if (new Date(channel.last_message_at) < new Date(m.created_at)) {
        channel.last_message_at = new Date(m.created_at);
      }

      return convertMessageToStorable(m, storables, this.userId);
    });

    newMessages = existingMessages.concat(newMessages);

    storables[channelKey] = channel;
    storables[getChannelMessagesKey(this.userId, channelId)] = newMessages;

    await this.multiSet(storables);
  }

  /**
   *
   * @param {*} channelId
   * @param {*} updatedMessage
   */
  async updateMessage(channelId, updatedMessage) {
    const storables = {};
    const existingMessages = await this.getItem(
      getChannelMessagesKey(this.userId, channelId),
      [],
    );

    const newMessages = existingMessages.map((m) => {
      if (m.id !== updatedMessage.id) {
        return m;
      }

      return convertMessageToStorable(updatedMessage, storables, this.userId);
    });

    storables[getChannelMessagesKey(this.userId, channelId)] = newMessages;

    await this.multiSet(storables);
  }

  /**
   *
   * @param {*} channelId
   * @param {*} message
   */
  async addReactionForMessage(channelId, message) {
    await this.updateMessage(channelId, message);
  }

  /**
   *
   * @param {*} channelId
   * @param {*} message
   */
  async deleteReactionForMessage(channelId, message) {
    await this.updateMessage(channelId, message);
  }

  async addMemberToChannel(channelId, member) {
    const storables = {};
    const channelMembersKey = getChannelMembersKey(this.userId, channelId);
    const newMember = convertMemberToStorable(member, storables, this.userId);
    const channelMembers = await this.getItem(channelMembersKey);

    channelMembers.push(newMember);

    storables[channelMembersKey] = channelMembers;

    await this.multiSet(storables);
  }

  async removeMemberFromChannel(channelId, user_id) {
    const storables = {};
    const channelMembersKey = getChannelMembersKey(this.userId, channelId);
    let channelMembers = await this.getItem(channelMembersKey);

    channelMembers = channelMembers.filter((m) => m.user_id !== user_id);

    storables[channelMembersKey] = channelMembers;

    await this.multiSet(storables);
  }

  // TODO: Test this scenario
  async updateMember(channelId, member) {
    const storables = {};
    const channelMembersKey = getChannelMembersKey(this.userId, channelId);
    let channelMembers = await this.getItem(channelMembersKey);

    channelMembers = channelMembers.map((m) => {
      if (m.user_id !== member.user.id) return m;

      return convertMemberToStorable(member, storables, this.userId);
    });

    storables[channelMembersKey] = channelMembers;

    await this.multiSet(storables);
  }

  /**
   *
   * @param {*} channelId
   * @param {*} user
   * @param {*} lastRead
   */
  async updateReadState(channelId, user, lastRead) {
    const reads = await this.getItem(getChannelReadKey(this.userId, channelId));
    const storables = {};

    if (reads[user.id]) {
      reads[user.id] = {
        last_read: lastRead,
        user: convertUserToStorable(user.id, user, storables, this.userId),
      };
    }

    storables[getChannelReadKey(this.userId, channelId)] = reads;
    await this.multiSet(storables);
  }

  /**
   * TODO: Abstract out logic between queryChannels and queryMessages functions.
   *
   * @param {*} channelId
   * @param {*} lastMessage
   * @param {*} limitPerPage
   */
  async queryMessages(channelId, lastMessage, limitPerPage = 100) {
    const channelMessagesKey = getChannelMessagesKey(this.userId, channelId);
    let messages = await this.getItem(channelMessagesKey);
    if (!messages || messages.length === 0) return { messages: [] };

    messages = messages.sort((a, b) =>
      new Date(a.created_at) > new Date(b.created_at) ? -1 : 1,
    );
    const indexOfLastMessage = messages.findIndex(
      (m) => m.id === lastMessage.id,
    );
    const paginatedMessages = messages.slice(
      indexOfLastMessage,
      indexOfLastMessage + limitPerPage,
    );
    let usersToRetrive = [];

    paginatedMessages.forEach((m) => {
      usersToRetrive.push(m.user);
      m.mentioned_users.forEach((u) => usersToRetrive.push(u));
      m.latest_reactions.forEach((r) => usersToRetrive.push(r.user));
    });

    usersToRetrive = usersToRetrive.filter(
      (item, index) => usersToRetrive.indexOf(item) === index,
    );

    const users = await this.multiGet(usersToRetrive);

    const finalMessages = paginatedMessages.map((m) => {
      const message = { ...m };
      message.user = users[message.user];
      message.mentioned_users = m.mentioned_users.map((u) => users[u]);
      message.latest_reactions = m.latest_reactions.map((r) => {
        const reaction = r;
        reaction.user = users[r.user];

        return reaction;
      });

      message.own_reactions = m.own_reactions.map((r) => {
        const reaction = r;
        reaction.user = users[r.user];

        return reaction;
      });

      return message;
    });
    return { messages: finalMessages };
  }

  /**
   *
   * @param {*} channelIds
   */
  async getChannels(channelIds) {
    const channelsValue = await this.asyncStorage.multiGet(channelIds);

    return channelsValue
      .map((ckPair) => JSON.parse(ckPair[1]))
      .filter((c) => (c ? true : false));
  }

  /**
   *
   * @param {*} channelId
   */
  async getChannel(channelId) {
    const channel = await this.getItem(getChannelKey(this.userId, channelId));

    return channel;
  }

  /**
   *
   * @param {*} channelIds
   */
  async getChannelMessages(channelIds) {
    const channelMsgsToRetrieve = channelIds.map((i) =>
      getChannelMessagesKey(this.userId, i),
    );

    return await this.multiGet(channelMsgsToRetrieve);
  }

  /**
   *
   * @param {*} query
   */
  async getChannelIdsForQuery(query) {
    let channelIds = await this.getItem(getQueryKey(this.userId, query));
    console.r.log('channelIds', channelIds);

    // .log('channelIds', channelIds);
    if (!channelIds) return [];
    channelIds = channelIds.filter(
      (item, index) => channelIds.indexOf(item) === index,
    );
    return channelIds;
  }

  async truncateChannel(channelId) {
    const channelMessagesKey = getChannelMessagesKey(this.userId, channelId);
    const storables = {};

    // Empty all the messages in the channel.
    storables[channelMessagesKey] = [];

    // update the last_message_at of that channel.
    const channel = await this.getChannel(channelId);
    channel.last_message_at = null;
    storables[getChannelKey(this.userId, channelId)] = channel;

    await this.multiSet(storables);
  }

  async deleteChannel(channelId) {
    const channelMessagesKey = getChannelMessagesKey(this.userId, channelId);
    const channelMembersKey = getChannelMembersKey(this.userId, channelId);
    const channelReadKey = getChannelReadKey(this.userId, channelId);
    const channelKey = getChannelKey(this.userId, channelId);

    await this.asyncStorage.multiRemove([
      channelMessagesKey,
      channelMembersKey,
      channelReadKey,
      channelKey,
    ]);
  }
}

export * from './keys';
