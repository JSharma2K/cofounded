import React, { useState, useEffect, useCallback, memo } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Text as RNText, Modal, Animated, ScrollView } from 'react-native';
import { Text, Snackbar } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSession } from '../../lib/hooks/useSession';
import { getCandidates, swipe } from '../../lib/api/candidates';
import { CandidateCard } from '../../components/CandidateCard';
import type { Candidate } from '../../lib/types';
import { colors, typography, spacing, borderRadius, shadows } from '../../utils/theme';
import { DOMAIN_CATEGORIES } from '../../utils/constants';

type SeekingOption = 'founder' | 'cofounder' | 'teammate' | 'mentor' | 'investor';

type Stage = 'idea' | 'prototype' | 'launched';

interface FilterModalProps {
  visible: boolean;
  tempMaxAge: number | null;
  setTempMaxAge: (age: number | null) => void;
  seekingFilter: SeekingOption[];
  toggleSeekingOption: (option: SeekingOption) => void;
  seekingOptionsOpen: boolean;
  setSeekingOptionsOpen: (open: boolean) => void;
  
  // For Founders
  businessDomainsFilter: string[];
  setBusinessDomainsFilter: (tags: string[]) => void;
  businessDomainsCategory: string | null;
  setBusinessDomainsCategory: (category: string | null) => void;
  businessDomainsDropdownOpen: boolean;
  setBusinessDomainsDropdownOpen: (open: boolean) => void;
  
  founderSkillsFilter: string[];
  setFounderSkillsFilter: (tags: string[]) => void;
  founderSkillsCategory: string | null;
  setFounderSkillsCategory: (category: string | null) => void;
  founderSkillsDropdownOpen: boolean;
  setFounderSkillsDropdownOpen: (open: boolean) => void;
  
  stageFilter: Stage[];
  setStageFilter: (stages: Stage[]) => void;
  stageDropdownOpen: boolean;
  setStageDropdownOpen: (open: boolean) => void;
  
  // For Cofounders/Teammates
  teammateSkillsFilter: string[];
  setTeammateSkillsFilter: (tags: string[]) => void;
  teammateSkillsCategory: string | null;
  setTeammateSkillsCategory: (category: string | null) => void;
  teammateSkillsDropdownOpen: boolean;
  setTeammateSkillsDropdownOpen: (open: boolean) => void;
  
  // For Mentors
  mentorAreaFilter: string[];
  setMentorAreaFilter: (tags: string[]) => void;
  mentorAreaCategory: string | null;
  setMentorAreaCategory: (category: string | null) => void;
  mentorAreaDropdownOpen: boolean;
  setMentorAreaDropdownOpen: (open: boolean) => void;
  
  mentorExperienceFilter: string[];
  setMentorExperienceFilter: (levels: string[]) => void;
  mentorExperienceDropdownOpen: boolean;
  setMentorExperienceDropdownOpen: (open: boolean) => void;
  
  // For Investors
  investorSectorsFilter: string[];
  setInvestorSectorsFilter: (tags: string[]) => void;
  investorSectorsCategory: string | null;
  setInvestorSectorsCategory: (category: string | null) => void;
  investorSectorsDropdownOpen: boolean;
  setInvestorSectorsDropdownOpen: (open: boolean) => void;
  
  investorStageFilter: string[];
  setInvestorStageFilter: (stages: string[]) => void;
  investorStageDropdownOpen: boolean;
  setInvestorStageDropdownOpen: (open: boolean) => void;
  
  investorTypeFilter: string[];
  setInvestorTypeFilter: (types: string[]) => void;
  investorTypeDropdownOpen: boolean;
  setInvestorTypeDropdownOpen: (open: boolean) => void;
  
  onClose: () => void;
  onReset: () => void;
}

const FilterModalComponent = memo(({
  visible,
  tempMaxAge,
  setTempMaxAge,
  seekingFilter,
  toggleSeekingOption,
  seekingOptionsOpen,
  setSeekingOptionsOpen,
  
  businessDomainsFilter,
  setBusinessDomainsFilter,
  businessDomainsCategory,
  setBusinessDomainsCategory,
  businessDomainsDropdownOpen,
  setBusinessDomainsDropdownOpen,
  
  founderSkillsFilter,
  setFounderSkillsFilter,
  founderSkillsCategory,
  setFounderSkillsCategory,
  founderSkillsDropdownOpen,
  setFounderSkillsDropdownOpen,
  
  stageFilter,
  setStageFilter,
  stageDropdownOpen,
  setStageDropdownOpen,
  
  teammateSkillsFilter,
  setTeammateSkillsFilter,
  teammateSkillsCategory,
  setTeammateSkillsCategory,
  teammateSkillsDropdownOpen,
  setTeammateSkillsDropdownOpen,
  
  mentorAreaFilter,
  setMentorAreaFilter,
  mentorAreaCategory,
  setMentorAreaCategory,
  mentorAreaDropdownOpen,
  setMentorAreaDropdownOpen,
  
  mentorExperienceFilter,
  setMentorExperienceFilter,
  mentorExperienceDropdownOpen,
  setMentorExperienceDropdownOpen,
  
  investorSectorsFilter,
  setInvestorSectorsFilter,
  investorSectorsCategory,
  setInvestorSectorsCategory,
  investorSectorsDropdownOpen,
  setInvestorSectorsDropdownOpen,
  
  investorStageFilter,
  setInvestorStageFilter,
  investorStageDropdownOpen,
  setInvestorStageDropdownOpen,
  
  investorTypeFilter,
  setInvestorTypeFilter,
  investorTypeDropdownOpen,
  setInvestorTypeDropdownOpen,
  
  onClose,
  onReset,
}: FilterModalProps) => {
  const formatSeekingLabel = useCallback((value: SeekingOption) => {
    switch (value) {
      case 'founder':
        return 'Founders';
      case 'cofounder':
        return 'Cofounders';
      case 'teammate':
        return 'Teammates';
      case 'mentor':
        return 'Mentors';
      case 'investor':
        return 'Investors';
      default:
        return value;
    }
  }, []);

  const seekingSummary = seekingFilter.length
    ? seekingFilter.map((option) => formatSeekingLabel(option)).join(', ')
    : 'All profiles';

  const seekingOptions: Array<{ value: SeekingOption; label: string; icon: string }> = [
    { value: 'founder', label: 'Founders', icon: 'account' },
    { value: 'cofounder', label: 'Cofounders', icon: 'account-multiple' },
    { value: 'teammate', label: 'Teammates', icon: 'account-group' },
    { value: 'mentor', label: 'Mentors', icon: 'school' },
    { value: 'investor', label: 'Investors', icon: 'cash-multiple' },
  ];

  // Check if founder is selected
  const showFounderFilters = seekingFilter.includes('founder');
  const showTeammateCofounderFilters = seekingFilter.includes('cofounder') || seekingFilter.includes('teammate');
  const showMentorFilters = seekingFilter.includes('mentor');
  const showInvestorFilters = seekingFilter.includes('investor');

  // Helper functions for business domains
  const businessDomainsSummary = businessDomainsFilter.length
    ? `${businessDomainsFilter.length} domain${businessDomainsFilter.length > 1 ? 's' : ''} selected`
    : 'No domains selected';

  const toggleBusinessDomainTag = useCallback((tag: string) => {
    if (businessDomainsFilter.includes(tag)) {
      setBusinessDomainsFilter(businessDomainsFilter.filter(t => t !== tag));
    } else {
      setBusinessDomainsFilter([...businessDomainsFilter, tag]);
    }
  }, [businessDomainsFilter, setBusinessDomainsFilter]);

  const removeBusinessDomainTag = useCallback((tag: string) => {
    setBusinessDomainsFilter(businessDomainsFilter.filter(t => t !== tag));
  }, [businessDomainsFilter, setBusinessDomainsFilter]);

  // Helper functions for founder skills
  const founderSkillsSummary = founderSkillsFilter.length
    ? `${founderSkillsFilter.length} skill${founderSkillsFilter.length > 1 ? 's' : ''} selected`
    : 'No skills selected';

  const toggleFounderSkillTag = useCallback((tag: string) => {
    if (founderSkillsFilter.includes(tag)) {
      setFounderSkillsFilter(founderSkillsFilter.filter(t => t !== tag));
    } else {
      setFounderSkillsFilter([...founderSkillsFilter, tag]);
    }
  }, [founderSkillsFilter, setFounderSkillsFilter]);

  const removeFounderSkillTag = useCallback((tag: string) => {
    setFounderSkillsFilter(founderSkillsFilter.filter(t => t !== tag));
  }, [founderSkillsFilter, setFounderSkillsFilter]);

  // Helper functions for stage
  const stageSummary = stageFilter.length
    ? stageFilter.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')
    : 'All stages';

  const toggleStage = useCallback((stage: Stage) => {
    if (stageFilter.includes(stage)) {
      setStageFilter(stageFilter.filter(s => s !== stage));
    } else {
      setStageFilter([...stageFilter, stage]);
    }
  }, [stageFilter, setStageFilter]);

  // Helper functions for teammate skills
  const teammateSkillsSummary = teammateSkillsFilter.length
    ? `${teammateSkillsFilter.length} skill${teammateSkillsFilter.length > 1 ? 's' : ''} selected`
    : 'No skills selected';

  const toggleTeammateSkillTag = useCallback((tag: string) => {
    if (teammateSkillsFilter.includes(tag)) {
      setTeammateSkillsFilter(teammateSkillsFilter.filter(t => t !== tag));
    } else {
      setTeammateSkillsFilter([...teammateSkillsFilter, tag]);
    }
  }, [teammateSkillsFilter, setTeammateSkillsFilter]);

  const removeTeammateSkillTag = useCallback((tag: string) => {
    setTeammateSkillsFilter(teammateSkillsFilter.filter(t => t !== tag));
  }, [teammateSkillsFilter, setTeammateSkillsFilter]);

  // Helper functions for mentor area
  const mentorAreaSummary = mentorAreaFilter.length
    ? `${mentorAreaFilter.length} area${mentorAreaFilter.length > 1 ? 's' : ''} selected`
    : 'No areas selected';

  const toggleMentorAreaTag = useCallback((tag: string) => {
    if (mentorAreaFilter.includes(tag)) {
      setMentorAreaFilter(mentorAreaFilter.filter(t => t !== tag));
    } else {
      setMentorAreaFilter([...mentorAreaFilter, tag]);
    }
  }, [mentorAreaFilter, setMentorAreaFilter]);

  const removeMentorAreaTag = useCallback((tag: string) => {
    setMentorAreaFilter(mentorAreaFilter.filter(t => t !== tag));
  }, [mentorAreaFilter, setMentorAreaFilter]);

  // Helper functions for mentor experience
  const mentorExperienceSummary = mentorExperienceFilter.length
    ? mentorExperienceFilter.join(', ')
    : 'All experience levels';

  const toggleMentorExperience = useCallback((level: string) => {
    if (mentorExperienceFilter.includes(level)) {
      setMentorExperienceFilter(mentorExperienceFilter.filter(l => l !== level));
    } else {
      setMentorExperienceFilter([...mentorExperienceFilter, level]);
    }
  }, [mentorExperienceFilter, setMentorExperienceFilter]);

  // Helper functions for investor sectors
  const investorSectorsSummary = investorSectorsFilter.length
    ? `${investorSectorsFilter.length} sector${investorSectorsFilter.length > 1 ? 's' : ''} selected`
    : 'No sectors selected';

  const toggleInvestorSectorTag = useCallback((tag: string) => {
    if (investorSectorsFilter.includes(tag)) {
      setInvestorSectorsFilter(investorSectorsFilter.filter(t => t !== tag));
    } else {
      setInvestorSectorsFilter([...investorSectorsFilter, tag]);
    }
  }, [investorSectorsFilter, setInvestorSectorsFilter]);

  const removeInvestorSectorTag = useCallback((tag: string) => {
    setInvestorSectorsFilter(investorSectorsFilter.filter(t => t !== tag));
  }, [investorSectorsFilter, setInvestorSectorsFilter]);

  // Helper functions for investor funding stage
  const investorStageSummary = investorStageFilter.length
    ? investorStageFilter.join(', ')
    : 'All stages';

  const toggleInvestorStage = useCallback((stage: string) => {
    if (investorStageFilter.includes(stage)) {
      setInvestorStageFilter(investorStageFilter.filter(s => s !== stage));
    } else {
      setInvestorStageFilter([...investorStageFilter, stage]);
    }
  }, [investorStageFilter, setInvestorStageFilter]);

  // Helper functions for investor type
  const investorTypeSummary = investorTypeFilter.length
    ? investorTypeFilter.join(', ')
    : 'All types';

  const toggleInvestorType = useCallback((type: string) => {
    if (investorTypeFilter.includes(type)) {
      setInvestorTypeFilter(investorTypeFilter.filter(t => t !== type));
    } else {
      setInvestorTypeFilter([...investorTypeFilter, type]);
    }
  }, [investorTypeFilter, setInvestorTypeFilter]);

  // Reusable component for tag selection
  const renderTagSelector = (
    title: string,
    summary: string,
    selectedCategory: string | null,
    setCategory: (cat: string | null) => void,
    dropdownOpen: boolean,
    setDropdownOpen: (open: boolean) => void,
    selectedTags: string[],
    toggleTag: (tag: string) => void,
    removeTag: (tag: string) => void
  ) => (
    <>
      <RNText style={styles.filterModalSubsectionTitle}>{title}</RNText>
      <RNText style={styles.filterModalHint}>{summary}</RNText>

      {/* Category Dropdown */}
      <TouchableOpacity
        style={styles.filterModalCategoryPicker}
        onPress={() => setDropdownOpen(true)}
        activeOpacity={0.7}
      >
        <RNText style={[
          styles.filterModalCategoryPickerText,
          !selectedCategory && styles.filterModalCategoryPickerPlaceholder
        ]}>
          {selectedCategory || 'Select a category...'}
        </RNText>
        <RNText style={styles.filterModalCategoryPickerIcon}>▼</RNText>
      </TouchableOpacity>

      {/* Category Selection Modal */}
      <Modal
        visible={dropdownOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDropdownOpen(false)}
      >
        <TouchableOpacity
          style={styles.filterModalCategoryOverlay}
          activeOpacity={1}
          onPress={() => setDropdownOpen(false)}
        >
          <View style={styles.filterModalCategoryContainer}>
            <ScrollView style={styles.filterModalCategoryScroll} showsVerticalScrollIndicator={false}>
              {Object.keys(DOMAIN_CATEGORIES).map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.filterModalCategoryItem,
                    selectedCategory === category && styles.filterModalCategoryItemSelected
                  ]}
                  onPress={() => {
                    setCategory(category);
                    setDropdownOpen(false);
                  }}
                >
                  <RNText style={[
                    styles.filterModalCategoryItemText,
                    selectedCategory === category && styles.filterModalCategoryItemTextSelected
                  ]}>
                    {category}
                  </RNText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Tags for Selected Category */}
      {selectedCategory && (
        <>
          <RNText style={styles.filterModalSubLabel}>
            Select tags from {selectedCategory}
          </RNText>
          <View style={styles.filterModalTagsContainer}>
            {DOMAIN_CATEGORIES[selectedCategory as keyof typeof DOMAIN_CATEGORIES].map((tag) => (
              <TouchableOpacity
                key={tag}
                onPress={() => toggleTag(tag)}
                style={[
                  styles.filterModalTag,
                  selectedTags.includes(tag) && styles.filterModalTagSelected,
                ]}
                activeOpacity={0.7}
              >
                <RNText
                  style={[
                    styles.filterModalTagText,
                    selectedTags.includes(tag) && styles.filterModalTagTextSelected,
                  ]}
                >
                  {tag}
                </RNText>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <View style={styles.filterModalSelectedContainer}>
          <RNText style={styles.filterModalSelectedLabel}>Selected:</RNText>
          <View style={styles.filterModalTagsContainer}>
            {selectedTags.map((tag) => (
              <View key={tag} style={[styles.filterModalTag, styles.filterModalTagSelected]}>
                <RNText style={[styles.filterModalTagText, styles.filterModalTagTextSelected]}>
                  {tag}
                </RNText>
                <TouchableOpacity onPress={() => removeTag(tag)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <MaterialCommunityIcons name="close-circle" size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}
    </>
  );

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.filterModalFullScreen}>
        {/* Header */}
        <View style={styles.filterModalHeader}>
          <RNText style={styles.filterModalTitle}>Filters</RNText>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialCommunityIcons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Scrollable Content */}
        <ScrollView 
          style={styles.filterModalScroll}
          contentContainerStyle={styles.filterModalScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Age Filter */}
          <View style={styles.filterModalSection}>
            <View style={styles.filterModalSectionHeader}>
              <RNText style={styles.filterModalSectionTitle}>MAXIMUM AGE</RNText>
              <RNText style={styles.filterModalAgeValue}>
                {tempMaxAge === null ? 'Any' : tempMaxAge}
              </RNText>
            </View>
            <RNText style={styles.filterModalHint}>
              Adjust the slider to cap the age range shown in your feed.
            </RNText>
            <Slider
              style={styles.filterModalSlider}
              minimumValue={18}
              maximumValue={100}
              step={1}
              value={tempMaxAge ?? 100}
              onValueChange={setTempMaxAge}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
            <View style={styles.filterModalSliderLabels}>
              <RNText style={styles.filterModalSliderLabel}>18</RNText>
              <TouchableOpacity onPress={() => setTempMaxAge(null)}>
                <RNText style={styles.filterModalAnyButton}>Any Age</RNText>
              </TouchableOpacity>
              <RNText style={styles.filterModalSliderLabel}>100</RNText>
            </View>
          </View>

          {/* Looking For Filter */}
          <View style={styles.filterModalSection}>
            <TouchableOpacity
              style={[
                styles.filterModalDropdown,
                seekingOptionsOpen && styles.filterModalDropdownOpen
              ]}
              onPress={() => setSeekingOptionsOpen(!seekingOptionsOpen)}
              activeOpacity={0.7}
            >
              <View style={{ flex: 1 }}>
                <RNText style={styles.filterModalSectionTitle}>LOOKING FOR</RNText>
                <RNText style={styles.filterModalDropdownValue}>{seekingSummary}</RNText>
              </View>
              <MaterialCommunityIcons
                name={seekingOptionsOpen ? 'chevron-up' : 'chevron-down'}
                size={24}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            {seekingOptionsOpen && (
              <View style={styles.filterModalDropdownList}>
                <RNText style={styles.filterModalHint}>
                  Select one or more profile types to show in your feed.
                </RNText>
                {seekingOptions.map((option) => {
                  const isSelected = seekingFilter.includes(option.value);
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.filterModalOption,
                        isSelected && styles.filterModalOptionActive
                      ]}
                      onPress={() => toggleSeekingOption(option.value)}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons
                        name={option.icon as any}
                        size={22}
                        color={isSelected ? colors.primary : colors.textSecondary}
                      />
                      <RNText
                        style={[
                          styles.filterModalOptionText,
                          isSelected && styles.filterModalOptionTextActive
                        ]}
                      >
                        {option.label}
                      </RNText>
                      <MaterialCommunityIcons
                        name={isSelected ? 'check-circle' : 'checkbox-blank-circle-outline'}
                        size={22}
                        color={isSelected ? colors.primary : colors.textTertiary}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Filters for Founders */}
          {showFounderFilters && (
            <View style={styles.filterModalSection}>
              <RNText style={styles.filterModalSectionTitle}>FOR FOUNDERS</RNText>
              
              {/* Business Domains */}
              <View style={styles.filterModalSubsection}>
                {renderTagSelector(
                  'Business Domain',
                  businessDomainsSummary,
                  businessDomainsCategory,
                  setBusinessDomainsCategory,
                  businessDomainsDropdownOpen,
                  setBusinessDomainsDropdownOpen,
                  businessDomainsFilter,
                  toggleBusinessDomainTag,
                  removeBusinessDomainTag
                )}
              </View>

              {/* Founder Skills & Expertise */}
              <View style={styles.filterModalSubsection}>
                {renderTagSelector(
                  'Skills & Expertise',
                  founderSkillsSummary,
                  founderSkillsCategory,
                  setFounderSkillsCategory,
                  founderSkillsDropdownOpen,
                  setFounderSkillsDropdownOpen,
                  founderSkillsFilter,
                  toggleFounderSkillTag,
                  removeFounderSkillTag
                )}
              </View>

              {/* Stage */}
              <View style={styles.filterModalSubsection}>
                <RNText style={styles.filterModalSubsectionTitle}>Current Stage</RNText>
                <RNText style={styles.filterModalHint}>{stageSummary}</RNText>
                
                <TouchableOpacity
                  style={[
                    styles.filterModalDropdown,
                    stageDropdownOpen && styles.filterModalDropdownOpen
                  ]}
                  onPress={() => setStageDropdownOpen(!stageDropdownOpen)}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <RNText style={styles.filterModalDropdownValue}>{stageSummary}</RNText>
                  </View>
                  <MaterialCommunityIcons
                    name={stageDropdownOpen ? 'chevron-up' : 'chevron-down'}
                    size={24}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>

                {stageDropdownOpen && (
                  <View style={styles.filterModalDropdownList}>
                    {(['idea', 'prototype', 'launched'] as Stage[]).map((stage) => {
                      const isSelected = stageFilter.includes(stage);
                      return (
                        <TouchableOpacity
                          key={stage}
                          style={[
                            styles.filterModalOption,
                            isSelected && styles.filterModalOptionActive
                          ]}
                          onPress={() => toggleStage(stage)}
                          activeOpacity={0.7}
                        >
                          <MaterialCommunityIcons
                            name="rocket-launch"
                            size={22}
                            color={isSelected ? colors.primary : colors.textSecondary}
                          />
                          <RNText
                            style={[
                              styles.filterModalOptionText,
                              isSelected && styles.filterModalOptionTextActive
                            ]}
                          >
                            {stage.charAt(0).toUpperCase() + stage.slice(1)}
                          </RNText>
                          <MaterialCommunityIcons
                            name={isSelected ? 'check-circle' : 'checkbox-blank-circle-outline'}
                            size={22}
                            color={isSelected ? colors.primary : colors.textTertiary}
                          />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Filters for Cofounders/Teammates */}
          {showTeammateCofounderFilters && (
            <View style={styles.filterModalSection}>
              <RNText style={styles.filterModalSectionTitle}>FOR COFOUNDERS & TEAMMATES</RNText>
              
              {/* Teammate Skills & Expertise */}
              <View style={styles.filterModalSubsection}>
                {renderTagSelector(
                  'Skills & Expertise',
                  teammateSkillsSummary,
                  teammateSkillsCategory,
                  setTeammateSkillsCategory,
                  teammateSkillsDropdownOpen,
                  setTeammateSkillsDropdownOpen,
                  teammateSkillsFilter,
                  toggleTeammateSkillTag,
                  removeTeammateSkillTag
                )}
              </View>
            </View>
          )}

          {/* Filters for Mentors */}
          {showMentorFilters && (
            <View style={styles.filterModalSection}>
              <RNText style={styles.filterModalSectionTitle}>FOR MENTORS</RNText>
              
              {/* Mentor Area */}
              <View style={styles.filterModalSubsection}>
                {renderTagSelector(
                  'Mentor Area',
                  mentorAreaSummary,
                  mentorAreaCategory,
                  setMentorAreaCategory,
                  mentorAreaDropdownOpen,
                  setMentorAreaDropdownOpen,
                  mentorAreaFilter,
                  toggleMentorAreaTag,
                  removeMentorAreaTag
                )}
              </View>

              {/* Years of Experience */}
              <View style={styles.filterModalSubsection}>
                <RNText style={styles.filterModalSubsectionTitle}>Years of Experience</RNText>
                <RNText style={styles.filterModalHint}>{mentorExperienceSummary}</RNText>
                
                <TouchableOpacity
                  style={[
                    styles.filterModalDropdown,
                    mentorExperienceDropdownOpen && styles.filterModalDropdownOpen
                  ]}
                  onPress={() => setMentorExperienceDropdownOpen(!mentorExperienceDropdownOpen)}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <RNText style={styles.filterModalDropdownValue}>{mentorExperienceSummary}</RNText>
                  </View>
                  <MaterialCommunityIcons
                    name={mentorExperienceDropdownOpen ? 'chevron-up' : 'chevron-down'}
                    size={24}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>

                {mentorExperienceDropdownOpen && (
                  <View style={styles.filterModalDropdownList}>
                    {[
                      { value: '5-10', label: '5-10 years' },
                      { value: '10-15', label: '10-15 years' },
                      { value: '15+', label: '15+ years' },
                    ].map((option) => {
                      const isSelected = mentorExperienceFilter.includes(option.value);
                      return (
                        <TouchableOpacity
                          key={option.value}
                          style={[
                            styles.filterModalOption,
                            isSelected && styles.filterModalOptionActive
                          ]}
                          onPress={() => toggleMentorExperience(option.value)}
                          activeOpacity={0.7}
                        >
                          <MaterialCommunityIcons
                            name="clock-outline"
                            size={22}
                            color={isSelected ? colors.primary : colors.textSecondary}
                          />
                          <RNText
                            style={[
                              styles.filterModalOptionText,
                              isSelected && styles.filterModalOptionTextActive
                            ]}
                          >
                            {option.label}
                          </RNText>
                          <MaterialCommunityIcons
                            name={isSelected ? 'check-circle' : 'checkbox-blank-circle-outline'}
                            size={22}
                            color={isSelected ? colors.primary : colors.textTertiary}
                          />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Filters for Investors */}
          {showInvestorFilters && (
            <View style={styles.filterModalSection}>
              <RNText style={styles.filterModalSectionTitle}>FOR INVESTORS</RNText>
              
              {/* Investment Sectors */}
              <View style={styles.filterModalSubsection}>
                {renderTagSelector(
                  'Investment Sectors',
                  investorSectorsSummary,
                  investorSectorsCategory,
                  setInvestorSectorsCategory,
                  investorSectorsDropdownOpen,
                  setInvestorSectorsDropdownOpen,
                  investorSectorsFilter,
                  toggleInvestorSectorTag,
                  removeInvestorSectorTag
                )}
              </View>

              {/* Stage of Funding */}
              <View style={styles.filterModalSubsection}>
                <RNText style={styles.filterModalSubsectionTitle}>Stage of Funding</RNText>
                <RNText style={styles.filterModalHint}>{investorStageSummary}</RNText>
                
                <TouchableOpacity
                  style={[
                    styles.filterModalDropdown,
                    investorStageDropdownOpen && styles.filterModalDropdownOpen
                  ]}
                  onPress={() => setInvestorStageDropdownOpen(!investorStageDropdownOpen)}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <RNText style={styles.filterModalDropdownValue}>{investorStageSummary}</RNText>
                  </View>
                  <MaterialCommunityIcons
                    name={investorStageDropdownOpen ? 'chevron-up' : 'chevron-down'}
                    size={24}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>

                {investorStageDropdownOpen && (
                  <View style={styles.filterModalDropdownList}>
                    {[
                      { value: 'pre-seed', label: 'Pre-seed' },
                      { value: 'seed', label: 'Seed' },
                      { value: 'series-a', label: 'Series A' },
                      { value: 'growth', label: 'Growth' },
                    ].map((option) => {
                      const isSelected = investorStageFilter.includes(option.value);
                      return (
                        <TouchableOpacity
                          key={option.value}
                          style={[
                            styles.filterModalOption,
                            isSelected && styles.filterModalOptionActive
                          ]}
                          onPress={() => toggleInvestorStage(option.value)}
                          activeOpacity={0.7}
                        >
                          <MaterialCommunityIcons
                            name="rocket-launch"
                            size={22}
                            color={isSelected ? colors.primary : colors.textSecondary}
                          />
                          <RNText
                            style={[
                              styles.filterModalOptionText,
                              isSelected && styles.filterModalOptionTextActive
                            ]}
                          >
                            {option.label}
                          </RNText>
                          <MaterialCommunityIcons
                            name={isSelected ? 'check-circle' : 'checkbox-blank-circle-outline'}
                            size={22}
                            color={isSelected ? colors.primary : colors.textTertiary}
                          />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>

              {/* Investment Type */}
              <View style={styles.filterModalSubsection}>
                <RNText style={styles.filterModalSubsectionTitle}>Investment Type</RNText>
                <RNText style={styles.filterModalHint}>{investorTypeSummary}</RNText>
                
                <TouchableOpacity
                  style={[
                    styles.filterModalDropdown,
                    investorTypeDropdownOpen && styles.filterModalDropdownOpen
                  ]}
                  onPress={() => setInvestorTypeDropdownOpen(!investorTypeDropdownOpen)}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <RNText style={styles.filterModalDropdownValue}>{investorTypeSummary}</RNText>
                  </View>
                  <MaterialCommunityIcons
                    name={investorTypeDropdownOpen ? 'chevron-up' : 'chevron-down'}
                    size={24}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>

                {investorTypeDropdownOpen && (
                  <View style={styles.filterModalDropdownList}>
                    {[
                      { value: 'angel', label: 'Angel' },
                      { value: 'vc', label: 'VC' },
                      { value: 'family-office', label: 'Family Office' },
                      { value: 'corporate-vc', label: 'Corporate VC' },
                      { value: 'fund-manager', label: 'Fund Manager' },
                    ].map((option) => {
                      const isSelected = investorTypeFilter.includes(option.value);
                      return (
                        <TouchableOpacity
                          key={option.value}
                          style={[
                            styles.filterModalOption,
                            isSelected && styles.filterModalOptionActive
                          ]}
                          onPress={() => toggleInvestorType(option.value)}
                          activeOpacity={0.7}
                        >
                          <MaterialCommunityIcons
                            name="cash-multiple"
                            size={22}
                            color={isSelected ? colors.primary : colors.textSecondary}
                          />
                          <RNText
                            style={[
                              styles.filterModalOptionText,
                              isSelected && styles.filterModalOptionTextActive
                            ]}
                          >
                            {option.label}
                          </RNText>
                          <MaterialCommunityIcons
                            name={isSelected ? 'check-circle' : 'checkbox-blank-circle-outline'}
                            size={22}
                            color={isSelected ? colors.primary : colors.textTertiary}
                          />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Footer Buttons */}
        <View style={styles.filterModalFooter}>
          <TouchableOpacity
            style={styles.filterModalResetButton}
            onPress={onReset}
            activeOpacity={0.7}
          >
            <RNText style={styles.filterModalResetText}>Reset</RNText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterModalApplyButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <RNText style={styles.filterModalApplyText}>Apply Filters</RNText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
});

FilterModalComponent.displayName = 'FilterModalComponent';

export default function FeedScreen() {
  const router = useRouter();
  const { user } = useSession();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedCandidate, setMatchedCandidate] = useState<Candidate | null>(null);
  const [swipeLoading, setSwipeLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [maxAge, setMaxAge] = useState<number | null>(null);
  const [tempMaxAge, setTempMaxAge] = useState<number | null>(null);
  const [seekingFilter, setSeekingFilter] = useState<SeekingOption[]>([]);
  const [seekingOptionsOpen, setSeekingOptionsOpen] = useState(false);
  
  // For Founders
  const [businessDomainsFilter, setBusinessDomainsFilter] = useState<string[]>([]);
  const [businessDomainsCategory, setBusinessDomainsCategory] = useState<string | null>(null);
  const [businessDomainsDropdownOpen, setBusinessDomainsDropdownOpen] = useState(false);
  
  const [founderSkillsFilter, setFounderSkillsFilter] = useState<string[]>([]);
  const [founderSkillsCategory, setFounderSkillsCategory] = useState<string | null>(null);
  const [founderSkillsDropdownOpen, setFounderSkillsDropdownOpen] = useState(false);
  
  const [stageFilter, setStageFilter] = useState<Stage[]>([]);
  const [stageDropdownOpen, setStageDropdownOpen] = useState(false);
  
  // For Cofounders/Teammates
  const [teammateSkillsFilter, setTeammateSkillsFilter] = useState<string[]>([]);
  const [teammateSkillsCategory, setTeammateSkillsCategory] = useState<string | null>(null);
  const [teammateSkillsDropdownOpen, setTeammateSkillsDropdownOpen] = useState(false);
  
  // For Mentors
  const [mentorAreaFilter, setMentorAreaFilter] = useState<string[]>([]);
  const [mentorAreaCategory, setMentorAreaCategory] = useState<string | null>(null);
  const [mentorAreaDropdownOpen, setMentorAreaDropdownOpen] = useState(false);
  
  const [mentorExperienceFilter, setMentorExperienceFilter] = useState<string[]>([]);
  const [mentorExperienceDropdownOpen, setMentorExperienceDropdownOpen] = useState(false);
  
  // For Investors
  const [investorSectorsFilter, setInvestorSectorsFilter] = useState<string[]>([]);
  const [investorSectorsCategory, setInvestorSectorsCategory] = useState<string | null>(null);
  const [investorSectorsDropdownOpen, setInvestorSectorsDropdownOpen] = useState(false);
  
  const [investorStageFilter, setInvestorStageFilter] = useState<string[]>([]);
  const [investorStageDropdownOpen, setInvestorStageDropdownOpen] = useState(false);
  
  const [investorTypeFilter, setInvestorTypeFilter] = useState<string[]>([]);
  const [investorTypeDropdownOpen, setInvestorTypeDropdownOpen] = useState(false);

  const hasActiveFilters = maxAge !== null || seekingFilter.length > 0 || 
    businessDomainsFilter.length > 0 || founderSkillsFilter.length > 0 || 
    stageFilter.length > 0 || teammateSkillsFilter.length > 0 || 
    mentorAreaFilter.length > 0 || mentorExperienceFilter.length > 0 ||
    investorSectorsFilter.length > 0 || investorStageFilter.length > 0 || investorTypeFilter.length > 0;

  const toggleSeekingOption = useCallback((option: SeekingOption) => {
    setSeekingFilter((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  }, []);

  const closeFilters = useCallback(() => {
    setSeekingOptionsOpen(false);
    setBusinessDomainsDropdownOpen(false);
    setFounderSkillsDropdownOpen(false);
    setStageDropdownOpen(false);
    setTeammateSkillsDropdownOpen(false);
    setMentorAreaDropdownOpen(false);
    setMentorExperienceDropdownOpen(false);
    setInvestorSectorsDropdownOpen(false);
    setInvestorStageDropdownOpen(false);
    setInvestorTypeDropdownOpen(false);
    setShowFilters(false);
    // Apply the temp age to actual filter
    if (tempMaxAge !== null) {
      setMaxAge(tempMaxAge);
    }
  }, [tempMaxAge]);

  const openFilters = useCallback(() => {
    setTempMaxAge(maxAge);
    setShowFilters(true);
  }, [maxAge]);

  const resetFilters = useCallback(() => {
    setMaxAge(null);
    setTempMaxAge(null);
    setSeekingFilter([]);
    setSeekingOptionsOpen(false);
    
    setBusinessDomainsFilter([]);
    setBusinessDomainsCategory(null);
    setBusinessDomainsDropdownOpen(false);
    
    setFounderSkillsFilter([]);
    setFounderSkillsCategory(null);
    setFounderSkillsDropdownOpen(false);
    
    setStageFilter([]);
    setStageDropdownOpen(false);
    
    setTeammateSkillsFilter([]);
    setTeammateSkillsCategory(null);
    setTeammateSkillsDropdownOpen(false);
    
    setMentorAreaFilter([]);
    setMentorAreaCategory(null);
    setMentorAreaDropdownOpen(false);
    
    setMentorExperienceFilter([]);
    setMentorExperienceDropdownOpen(false);
    
    setInvestorSectorsFilter([]);
    setInvestorSectorsCategory(null);
    setInvestorSectorsDropdownOpen(false);
    
    setInvestorStageFilter([]);
    setInvestorStageDropdownOpen(false);
    
    setInvestorTypeFilter([]);
    setInvestorTypeDropdownOpen(false);
  }, []);

  const handleSetTempMaxAge = useCallback((age: number | null) => {
    setTempMaxAge(age);
  }, []);
  
  // Animation values
  const swipeAnimation = useState(new Animated.Value(0))[0];
  const fadeAnimation = useState(new Animated.Value(1))[0];

  const getAgeUpperBound = (band?: string | null) => {
    if (!band) return Infinity;
    if (band.includes('+')) {
      const base = parseInt(band.replace('+', ''), 10);
      return Number.isNaN(base) ? Infinity : base;
    }
    const parts = band.split('-');
    const upper = parseInt(parts[parts.length - 1], 10);
    return Number.isNaN(upper) ? Infinity : upper;
  };

  const applyFilters = (data: Candidate[]) => {
    let filtered = [...data];

    // Apply age filter
    if (maxAge !== null) {
      filtered = filtered.filter(candidate => maxAge >= getAgeUpperBound(candidate.user.age_band));
    }

    // Apply seeking filter
    if (seekingFilter.length > 0) {
      filtered = filtered.filter(candidate => {
        const target = candidate.intent?.seeking as SeekingOption | undefined;
        return target ? seekingFilter.includes(target) : false;
      });
    }

    // Apply filters for founders
    if (businessDomainsFilter.length > 0) {
      filtered = filtered.filter(candidate => {
        if (candidate.intent?.seeking !== 'founder') return false;
        const candidateDomains = candidate.profile.domains || [];
        return businessDomainsFilter.some(domain => candidateDomains.includes(domain));
      });
    }

    if (founderSkillsFilter.length > 0) {
      filtered = filtered.filter(candidate => {
        if (candidate.intent?.seeking !== 'founder') return false;
        const candidateTags = [
          ...(candidate.profile.domains || []),
          ...(candidate.profile.skills || []),
          ...(candidate.intent?.expertise_areas || []),
        ];
        return founderSkillsFilter.some(skill => candidateTags.includes(skill));
      });
    }

    if (stageFilter.length > 0) {
      filtered = filtered.filter(candidate => {
        if (candidate.intent?.seeking !== 'founder') return false;
        return candidate.profile.stage ? stageFilter.includes(candidate.profile.stage as Stage) : false;
      });
    }

    // Apply filters for cofounders/teammates
    if (teammateSkillsFilter.length > 0) {
      filtered = filtered.filter(candidate => {
        const isTeammateOrCofounder = candidate.intent?.seeking === 'cofounder' || candidate.intent?.seeking === 'teammate';
        if (!isTeammateOrCofounder) return false;
        
        const candidateTags = [
          ...(candidate.profile.domains || []),
          ...(candidate.profile.skills || []),
          ...(candidate.intent?.expertise_areas || []),
        ];
        return teammateSkillsFilter.some(skill => candidateTags.includes(skill));
      });
    }

    // Apply filters for mentors
    if (mentorAreaFilter.length > 0) {
      filtered = filtered.filter(candidate => {
        if (candidate.intent?.seeking !== 'mentor') return false;
        const candidateTags = [
          ...(candidate.profile.domains || []),
          ...(candidate.profile.skills || []),
          ...(candidate.intent?.expertise_areas || []),
        ];
        return mentorAreaFilter.some(area => candidateTags.includes(area));
      });
    }

    if (mentorExperienceFilter.length > 0) {
      filtered = filtered.filter(candidate => {
        if (candidate.intent?.seeking !== 'mentor') return false;
        return candidate.intent?.experience_level ? mentorExperienceFilter.includes(candidate.intent.experience_level) : false;
      });
    }

    // Apply filters for investors
    if (investorSectorsFilter.length > 0) {
      filtered = filtered.filter(candidate => {
        if (candidate.intent?.seeking !== 'investor') return false;
        const candidateTags = [
          ...(candidate.profile.domains || []),
          ...(candidate.profile.skills || []),
          ...(candidate.intent?.expertise_areas || []),
        ];
        return investorSectorsFilter.some(sector => candidateTags.includes(sector));
      });
    }

    if (investorStageFilter.length > 0) {
      filtered = filtered.filter(candidate => {
        if (candidate.intent?.seeking !== 'investor') return false;
        return candidate.intent?.experience_level ? investorStageFilter.includes(candidate.intent.experience_level) : false;
      });
    }

    if (investorTypeFilter.length > 0) {
      filtered = filtered.filter(candidate => {
        if (candidate.intent?.seeking !== 'investor') return false;
        return candidate.intent?.investment_type ? investorTypeFilter.includes(candidate.intent.investment_type) : false;
      });
    }

    return filtered;
  };

  const loadCandidates = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const data = await getCandidates(50);
      setAllCandidates(data);
      setCandidates(applyFilters(data));
    } catch (err: any) {
      setError(err.message || 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, [user]);

  // Reapply filters when filter settings change
  useEffect(() => {
    setCandidates(applyFilters(allCandidates));
  }, [maxAge, seekingFilter]);

  const handleSwipe = async (targetId: string, direction: 'like' | 'pass') => {
    setSwipeLoading(true);
    setError('');

    try {
      // Animate card swipe
      const targetX = direction === 'like' ? 400 : -400; // Right for like, left for pass
      
      Animated.parallel([
        Animated.timing(swipeAnimation, {
          toValue: targetX,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Wait for animation before making the API call
      await new Promise(resolve => setTimeout(resolve, 300));

      const result = await swipe(targetId, direction);
      
      // Remove from list and reset animations
      setCandidates((prev) => prev.filter((c) => c.user.id !== targetId));
      swipeAnimation.setValue(0);
      fadeAnimation.setValue(1);

      // Check for match
      if (direction === 'like' && result.match) {
        const matched = candidates.find((c) => c.user.id === targetId);
        setMatchedCandidate(matched || null);
        setShowMatchModal(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to swipe');
      // Reset animations on error
      swipeAnimation.setValue(0);
      fadeAnimation.setValue(1);
    } finally {
      setSwipeLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (candidates.length === 0) {
    return (
      <View style={styles.container}>
        {/* Filter Button */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={openFilters}
            style={styles.filterButton}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="filter-variant" size={20} color={colors.text} />
            <RNText style={styles.filterButtonText}>Filter</RNText>
            {hasActiveFilters && <View style={styles.filterBadge} />}
          </TouchableOpacity>
        </View>

        <View style={styles.centered}>
          <MaterialCommunityIcons name="account-search" size={80} color={colors.textTertiary} />
          <Text variant="titleLarge" style={styles.emptyTitle}>
            No more candidates
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtitle}>
            {hasActiveFilters
              ? 'Try adjusting your filters to see more candidates'
              : 'Check back later for new potential cofounders'}
          </Text>
          <TouchableOpacity onPress={loadCandidates} style={styles.refreshButton} activeOpacity={0.8}>
            <MaterialCommunityIcons name="refresh" size={20} color={colors.text} />
            <RNText style={styles.refreshButtonText}>Refresh</RNText>
          </TouchableOpacity>
        </View>

        <FilterModalComponent
          visible={showFilters}
          tempMaxAge={tempMaxAge}
          setTempMaxAge={handleSetTempMaxAge}
          seekingFilter={seekingFilter}
          toggleSeekingOption={toggleSeekingOption}
          seekingOptionsOpen={seekingOptionsOpen}
          setSeekingOptionsOpen={setSeekingOptionsOpen}
          
          businessDomainsFilter={businessDomainsFilter}
          setBusinessDomainsFilter={setBusinessDomainsFilter}
          businessDomainsCategory={businessDomainsCategory}
          setBusinessDomainsCategory={setBusinessDomainsCategory}
          businessDomainsDropdownOpen={businessDomainsDropdownOpen}
          setBusinessDomainsDropdownOpen={setBusinessDomainsDropdownOpen}
          
          founderSkillsFilter={founderSkillsFilter}
          setFounderSkillsFilter={setFounderSkillsFilter}
          founderSkillsCategory={founderSkillsCategory}
          setFounderSkillsCategory={setFounderSkillsCategory}
          founderSkillsDropdownOpen={founderSkillsDropdownOpen}
          setFounderSkillsDropdownOpen={setFounderSkillsDropdownOpen}
          
          stageFilter={stageFilter}
          setStageFilter={setStageFilter}
          stageDropdownOpen={stageDropdownOpen}
          setStageDropdownOpen={setStageDropdownOpen}
          
          teammateSkillsFilter={teammateSkillsFilter}
          setTeammateSkillsFilter={setTeammateSkillsFilter}
          teammateSkillsCategory={teammateSkillsCategory}
          setTeammateSkillsCategory={setTeammateSkillsCategory}
          teammateSkillsDropdownOpen={teammateSkillsDropdownOpen}
          setTeammateSkillsDropdownOpen={setTeammateSkillsDropdownOpen}
          
          mentorAreaFilter={mentorAreaFilter}
          setMentorAreaFilter={setMentorAreaFilter}
          mentorAreaCategory={mentorAreaCategory}
          setMentorAreaCategory={setMentorAreaCategory}
          mentorAreaDropdownOpen={mentorAreaDropdownOpen}
          setMentorAreaDropdownOpen={setMentorAreaDropdownOpen}
          
          mentorExperienceFilter={mentorExperienceFilter}
          setMentorExperienceFilter={setMentorExperienceFilter}
          mentorExperienceDropdownOpen={mentorExperienceDropdownOpen}
          setMentorExperienceDropdownOpen={setMentorExperienceDropdownOpen}
          
          investorSectorsFilter={investorSectorsFilter}
          setInvestorSectorsFilter={setInvestorSectorsFilter}
          investorSectorsCategory={investorSectorsCategory}
          setInvestorSectorsCategory={setInvestorSectorsCategory}
          investorSectorsDropdownOpen={investorSectorsDropdownOpen}
          setInvestorSectorsDropdownOpen={setInvestorSectorsDropdownOpen}
          
          investorStageFilter={investorStageFilter}
          setInvestorStageFilter={setInvestorStageFilter}
          investorStageDropdownOpen={investorStageDropdownOpen}
          setInvestorStageDropdownOpen={setInvestorStageDropdownOpen}
          
          investorTypeFilter={investorTypeFilter}
          setInvestorTypeFilter={setInvestorTypeFilter}
          investorTypeDropdownOpen={investorTypeDropdownOpen}
          setInvestorTypeDropdownOpen={setInvestorTypeDropdownOpen}
          
          onClose={closeFilters}
          onReset={resetFilters}
        />

        <Snackbar visible={!!error} onDismiss={() => setError('')} duration={4000} style={styles.errorSnackbar}>
          {error}
        </Snackbar>
      </View>
    );
  }

  const currentCandidate = candidates[0];

      return (
        <View style={styles.container}>
          {/* Filter Button */}
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={openFilters}
              style={styles.filterButton}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="filter-variant" size={20} color={colors.text} />
              <RNText style={styles.filterButtonText}>Filters</RNText>
              {hasActiveFilters && <View style={styles.filterBadge} />}
            </TouchableOpacity>
          </View>

          <Animated.View 
            style={[
              styles.cardContainer,
              {
                transform: [{ translateX: swipeAnimation }],
                opacity: fadeAnimation,
              }
            ]}
          >
            <CandidateCard candidate={currentCandidate} />
          </Animated.View>

          {/* Buttons positioned below card */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              onPress={() => handleSwipe(currentCandidate.user.id, 'pass')}
              disabled={swipeLoading}
              style={[styles.actionButton, styles.passButton, swipeLoading && styles.actionButtonDisabled]}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="close" size={24} color={colors.text} />
              <RNText style={styles.actionButtonText}>Pass</RNText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSwipe(currentCandidate.user.id, 'like')}
              disabled={swipeLoading}
              style={[styles.actionButton, styles.likeButton, swipeLoading && styles.actionButtonDisabled]}
              activeOpacity={0.8}
            >
              {swipeLoading ? (
                <ActivityIndicator color={colors.text} size="small" />
              ) : (
                <>
                    <MaterialCommunityIcons name="thumb-up" size={24} color={colors.text} />
                  <RNText style={styles.actionButtonText}>Like</RNText>
                </>
              )}
            </TouchableOpacity>
          </View>

      <FilterModalComponent
        visible={showFilters}
        tempMaxAge={tempMaxAge}
        setTempMaxAge={handleSetTempMaxAge}
        seekingFilter={seekingFilter}
        toggleSeekingOption={toggleSeekingOption}
        seekingOptionsOpen={seekingOptionsOpen}
        setSeekingOptionsOpen={setSeekingOptionsOpen}
        
        businessDomainsFilter={businessDomainsFilter}
        setBusinessDomainsFilter={setBusinessDomainsFilter}
        businessDomainsCategory={businessDomainsCategory}
        setBusinessDomainsCategory={setBusinessDomainsCategory}
        businessDomainsDropdownOpen={businessDomainsDropdownOpen}
        setBusinessDomainsDropdownOpen={setBusinessDomainsDropdownOpen}
        
        founderSkillsFilter={founderSkillsFilter}
        setFounderSkillsFilter={setFounderSkillsFilter}
        founderSkillsCategory={founderSkillsCategory}
        setFounderSkillsCategory={setFounderSkillsCategory}
        founderSkillsDropdownOpen={founderSkillsDropdownOpen}
        setFounderSkillsDropdownOpen={setFounderSkillsDropdownOpen}
        
        stageFilter={stageFilter}
        setStageFilter={setStageFilter}
        stageDropdownOpen={stageDropdownOpen}
        setStageDropdownOpen={setStageDropdownOpen}
        
        teammateSkillsFilter={teammateSkillsFilter}
        setTeammateSkillsFilter={setTeammateSkillsFilter}
        teammateSkillsCategory={teammateSkillsCategory}
        setTeammateSkillsCategory={setTeammateSkillsCategory}
        teammateSkillsDropdownOpen={teammateSkillsDropdownOpen}
        setTeammateSkillsDropdownOpen={setTeammateSkillsDropdownOpen}
        
        mentorAreaFilter={mentorAreaFilter}
        setMentorAreaFilter={setMentorAreaFilter}
        mentorAreaCategory={mentorAreaCategory}
        setMentorAreaCategory={setMentorAreaCategory}
        mentorAreaDropdownOpen={mentorAreaDropdownOpen}
        setMentorAreaDropdownOpen={setMentorAreaDropdownOpen}
        
        mentorExperienceFilter={mentorExperienceFilter}
        setMentorExperienceFilter={setMentorExperienceFilter}
        mentorExperienceDropdownOpen={mentorExperienceDropdownOpen}
        setMentorExperienceDropdownOpen={setMentorExperienceDropdownOpen}
        
        investorSectorsFilter={investorSectorsFilter}
        setInvestorSectorsFilter={setInvestorSectorsFilter}
        investorSectorsCategory={investorSectorsCategory}
        setInvestorSectorsCategory={setInvestorSectorsCategory}
        investorSectorsDropdownOpen={investorSectorsDropdownOpen}
        setInvestorSectorsDropdownOpen={setInvestorSectorsDropdownOpen}
        
        investorStageFilter={investorStageFilter}
        setInvestorStageFilter={setInvestorStageFilter}
        investorStageDropdownOpen={investorStageDropdownOpen}
        setInvestorStageDropdownOpen={setInvestorStageDropdownOpen}
        
        investorTypeFilter={investorTypeFilter}
        setInvestorTypeFilter={setInvestorTypeFilter}
        investorTypeDropdownOpen={investorTypeDropdownOpen}
        setInvestorTypeDropdownOpen={setInvestorTypeDropdownOpen}
        
        onClose={closeFilters}
        onReset={resetFilters}
      />

      <Snackbar visible={!!error} onDismiss={() => setError('')} duration={4000} style={styles.errorSnackbar}>
        {error}
      </Snackbar>

      {/* Match Modal */}
      <Modal
        visible={showMatchModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMatchModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <MaterialCommunityIcons name="thumb-up" size={80} color={colors.primary} />
            
            <RNText style={styles.modalTitle}>It's a Match!</RNText>
            <RNText style={styles.modalSubtitle}>
              You and {matchedCandidate?.user.display_name || 'someone'} liked each other
            </RNText>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={() => setShowMatchModal(false)}
                activeOpacity={0.8}
              >
                <RNText style={styles.modalButtonSecondaryText}>Keep Swiping</RNText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalButtonPrimary}
                onPress={() => {
                  setShowMatchModal(false);
                  router.push('/(tabs)/matches');
                }}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="message" size={20} color={colors.text} />
                <RNText style={styles.modalButtonPrimaryText}>Send Message</RNText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <FilterModalComponent
        visible={showFilters}
        tempMaxAge={tempMaxAge}
        setTempMaxAge={handleSetTempMaxAge}
        seekingFilter={seekingFilter}
        toggleSeekingOption={toggleSeekingOption}
        seekingOptionsOpen={seekingOptionsOpen}
        setSeekingOptionsOpen={setSeekingOptionsOpen}
        
        businessDomainsFilter={businessDomainsFilter}
        setBusinessDomainsFilter={setBusinessDomainsFilter}
        businessDomainsCategory={businessDomainsCategory}
        setBusinessDomainsCategory={setBusinessDomainsCategory}
        businessDomainsDropdownOpen={businessDomainsDropdownOpen}
        setBusinessDomainsDropdownOpen={setBusinessDomainsDropdownOpen}
        
        founderSkillsFilter={founderSkillsFilter}
        setFounderSkillsFilter={setFounderSkillsFilter}
        founderSkillsCategory={founderSkillsCategory}
        setFounderSkillsCategory={setFounderSkillsCategory}
        founderSkillsDropdownOpen={founderSkillsDropdownOpen}
        setFounderSkillsDropdownOpen={setFounderSkillsDropdownOpen}
        
        stageFilter={stageFilter}
        setStageFilter={setStageFilter}
        stageDropdownOpen={stageDropdownOpen}
        setStageDropdownOpen={setStageDropdownOpen}
        
        teammateSkillsFilter={teammateSkillsFilter}
        setTeammateSkillsFilter={setTeammateSkillsFilter}
        teammateSkillsCategory={teammateSkillsCategory}
        setTeammateSkillsCategory={setTeammateSkillsCategory}
        teammateSkillsDropdownOpen={teammateSkillsDropdownOpen}
        setTeammateSkillsDropdownOpen={setTeammateSkillsDropdownOpen}
        
        mentorAreaFilter={mentorAreaFilter}
        setMentorAreaFilter={setMentorAreaFilter}
        mentorAreaCategory={mentorAreaCategory}
        setMentorAreaCategory={setMentorAreaCategory}
        mentorAreaDropdownOpen={mentorAreaDropdownOpen}
        setMentorAreaDropdownOpen={setMentorAreaDropdownOpen}
        
        mentorExperienceFilter={mentorExperienceFilter}
        setMentorExperienceFilter={setMentorExperienceFilter}
        mentorExperienceDropdownOpen={mentorExperienceDropdownOpen}
        setMentorExperienceDropdownOpen={setMentorExperienceDropdownOpen}
        
        investorSectorsFilter={investorSectorsFilter}
        setInvestorSectorsFilter={setInvestorSectorsFilter}
        investorSectorsCategory={investorSectorsCategory}
        setInvestorSectorsCategory={setInvestorSectorsCategory}
        investorSectorsDropdownOpen={investorSectorsDropdownOpen}
        setInvestorSectorsDropdownOpen={setInvestorSectorsDropdownOpen}
        
        investorStageFilter={investorStageFilter}
        setInvestorStageFilter={setInvestorStageFilter}
        investorStageDropdownOpen={investorStageDropdownOpen}
        setInvestorStageDropdownOpen={setInvestorStageDropdownOpen}
        
        investorTypeFilter={investorTypeFilter}
        setInvestorTypeFilter={setInvestorTypeFilter}
        investorTypeDropdownOpen={investorTypeDropdownOpen}
        setInvestorTypeDropdownOpen={setInvestorTypeDropdownOpen}
        
        onClose={closeFilters}
        onReset={resetFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
    gap: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.xxl,
    fontFamily: typography.fontFamilies.ui,
    color: colors.text,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamilies.ui,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
    marginTop: spacing.lg,
    ...shadows.md,
  },
  refreshButtonText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamilies.ui,
    color: colors.text,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: 'transparent',
  },
  actionButton: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 100,
    ...shadows.md,
  },
  passButton: {
    backgroundColor: colors.surfaceLight,
  },
  likeButton: {
    backgroundColor: colors.primary,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamilies.ui,
    color: colors.text,
    fontWeight: '600',
  },
  errorSnackbar: {
    backgroundColor: colors.error,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl * 2,
    alignItems: 'center',
    marginHorizontal: spacing.xl,
    maxWidth: 400,
    width: '90%',
    ...shadows.lg,
  },
  modalTitle: {
    fontSize: typography.fontSizes.display,
    fontFamily: typography.fontFamilies.ui,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  modalSubtitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamilies.ui,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: typography.fontSizes.base * typography.lineHeights.normal,
  },
  modalButtons: {
    flexDirection: 'column',
    gap: spacing.md,
    width: '100%',
  },
  modalButtonPrimary: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadows.md,
  },
  modalButtonPrimaryText: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamilies.ui,
    color: colors.text,
  },
  modalButtonSecondary: {
    backgroundColor: 'transparent',
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalButtonSecondaryText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamilies.ui,
    color: colors.textSecondary,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    ...shadows.sm,
  },
  filterButtonText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamilies.regular,
    color: colors.text,
  },
  filterBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  // Filter Modal Styles
  filterModalFullScreen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl + 40,
    paddingBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterModalTitle: {
    fontSize: typography.fontSizes.xxl,
    fontFamily: typography.fontFamilies.regular,
    color: colors.text,
    fontWeight: '600',
  },
  filterModalScroll: {
    flex: 1,
  },
  filterModalScrollContent: {
    paddingBottom: spacing.xl,
  },
  filterModalSection: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '30',
  },
  filterModalSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  filterModalSectionTitle: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  filterModalSubsection: {
    marginTop: spacing.lg,
  },
  filterModalSubsectionTitle: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamilies.regular,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  filterModalAgeValue: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamilies.regular,
    color: colors.primary,
  },
  filterModalHint: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textTertiary,
    marginBottom: spacing.md,
  },
  filterModalSlider: {
    width: '100%',
    height: 40,
  },
  filterModalSliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  filterModalSliderLabel: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textTertiary,
  },
  filterModalAnyButton: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamilies.regular,
    color: colors.primary,
    fontWeight: '500',
  },
  filterModalDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterModalDropdownOpen: {
    borderColor: colors.primary,
  },
  filterModalDropdownValue: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamilies.regular,
    color: colors.text,
    marginTop: spacing.xs,
  },
  filterModalDropdownList: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterModalSubLabel: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  filterModalCategoryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  filterModalCategoryPickerText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamilies.regular,
    color: colors.text,
    flex: 1,
  },
  filterModalCategoryPickerPlaceholder: {
    color: colors.textTertiary,
  },
  filterModalCategoryPickerIcon: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textSecondary,
  },
  filterModalCategoryOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  filterModalCategoryContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    maxHeight: '70%',
    width: '100%',
    ...shadows.lg,
  },
  filterModalCategoryScroll: {
    maxHeight: 500,
  },
  filterModalCategoryItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterModalCategoryItemSelected: {
    backgroundColor: colors.primary + '20',
  },
  filterModalCategoryItemText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamilies.regular,
    color: colors.text,
  },
  filterModalCategoryItemTextSelected: {
    color: colors.primary,
    fontFamily: typography.fontFamilies.regular,
  },
  filterModalTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  filterModalTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterModalTagSelected: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  filterModalTagText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamilies.regular,
    color: colors.text,
  },
  filterModalTagTextSelected: {
    color: colors.primary,
    fontFamily: typography.fontFamilies.regular,
  },
  filterModalSelectedContainer: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  filterModalSelectedLabel: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  filterModalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  filterModalOptionActive: {
    backgroundColor: colors.primary + '15',
  },
  filterModalOptionText: {
    flex: 1,
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textSecondary,
    marginLeft: spacing.md,
  },
  filterModalOptionTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  filterModalFooter: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xl + 20,
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  filterModalResetButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterModalResetText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textSecondary,
  },
  filterModalApplyButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  filterModalApplyText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamilies.regular,
    color: colors.text,
    fontWeight: '600',
  },
});

