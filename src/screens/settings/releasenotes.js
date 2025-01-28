import React from 'react';
import { ScrollView, Text } from 'react-native';
import navigationStyle from '../../components/navigationStyle';
import loc from '../../loc';

const ReleaseNotes = () => {
  const notes = require('./../../../release-notes.json');

  return (
      <ScrollView>
          <Text>{notes}</Text>
      </ScrollView>
  );
};

ReleaseNotes.navigationOptions = navigationStyle({}, opts => ({ ...opts, headerTitle: loc.settings.about_release_notes }));

export default ReleaseNotes;
