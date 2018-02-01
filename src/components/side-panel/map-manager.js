import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import styled from 'styled-components';

import Switch from 'components/common/switch';
import InfoHelper from 'components/common/info-helper';
import {
  PanelLabel,
  StyledPanelHeader,
  PanelHeaderTitle,
  PanelHeaderContent,
  PanelContent,
  PanelLabelBold,
  PanelLabelWrapper,
  CenterFlexbox,
  SidePanelSection
} from 'components/common/styled-components';
import PanelHeaderAction from 'components/side-panel/panel-header-action';
import {ArrowDown, EyeSeen, EyeUnseen, Upload} from 'components/common/icons';
import ColorSelector from './layer-panel/color-selector';
import VisConfigSlider from './layer-panel/vis-config-slider';
import {LAYER_VIS_CONFIGS} from 'keplergl-layers/layer-factory';

const StyledInteractionPanel = styled.div`
  padding-bottom: 12px;
`;

const StyledPanelContent = PanelContent.extend`
  border-top: 1px solid ${props => props.theme.panelBorderColor};
`;
export default class MapManager extends Component {
  static propTypes = {
    mapStyle: PropTypes.object.isRequired,
    onConfigChange: PropTypes.func.isRequired,
    onStyleChange: PropTypes.func.isRequired,
    onBuildingChange: PropTypes.func.isRequired
  };

  state = {
    isSelecting: false
  };

  _updateConfig = newProp => {
    const newConfig = {...this.props.mapStyle, ...newProp};
    this.props.onConfigChange(newConfig);
  };

  _toggleSelecting = () => {
    this.setState({isSelecting: !this.state.isSelecting});
  };

  _selectStyle = val => {
    this.props.onStyleChange(val);
    this._toggleSelecting();
  };

  render() {
    const {mapStyle} = this.props;
    const editableLayers = mapStyle.visibleLayerGroups;

    return (
      <div className="map-style-panel">
        <div>
          <MapStyleSelector
            mapStyle={mapStyle}
            isSelecting={this.state.isSelecting}
            onChange={this._selectStyle}
            toggleActive={this._toggleSelecting}
          />
          {Object.keys(editableLayers).length ? (
            <LayerGroupSelector
              layers={mapStyle.visibleLayerGroups}
              editableLayers={editableLayers}
              topLayers={mapStyle.topLayerGroups}
              onChange={this._updateConfig}
            />
          ) : null}
        </div>
        <BuildingLayer
          buildingLayer={mapStyle.buildingLayer}
          onChange={this.props.onBuildingChange}
        />
      </div>
    );
  }
}

const StyledMapDropdown = StyledPanelHeader.extend`
  height: 48px;
  margin-bottom: 5px;
  opacity: 1;
  position: relative;
  transition: opacity 0.05s ease-in, height 0.25s ease-out;
  
  &.collapsed {
    height: 0;
    margin-bottom: 0;
    opacity: 0;
  }

  :hover {
    cursor: pointer;
    background-color: ${props => props.theme.panelBackgroundHover};
  }

  .map-title-block img {
    margin-right: 12px;
  }

  .map-preview {
    border-radius: 3px;
    height: 30px;
    width: 40px;
  }
`;

const MapStyleSelector = ({mapStyle, onChange, toggleActive, isSelecting}) => (
  <div>
    <PanelLabel>Map style</PanelLabel>
    {Object.keys(mapStyle.mapStyles).map(op => (
      <StyledMapDropdown
        className={classnames('map-dropdown-option', {
          collapsed: !isSelecting && mapStyle.styleType !== op
        })}
        key={op}
        onClick={isSelecting ? () => onChange(op) : toggleActive}
      >
        <PanelHeaderContent className="map-title-block">
          <img className="map-preview" src={mapStyle.mapStyles[op].icon} />
          <PanelHeaderTitle className="map-preview-name">
            {mapStyle.mapStyles[op].label}
          </PanelHeaderTitle>
        </PanelHeaderContent>
        {!isSelecting ? (
          <PanelHeaderAction
            className="map-dropdown-option__enable-config"
            id="map-enable-config"
            IconComponent={ArrowDown}
            tooltip={'Select Base Map Style'}
            onClick={toggleActive}
          />
        ) : null}
      </StyledMapDropdown>
    ))}
  </div>
);

const StyledLayerGroupItem = styled.div`
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;

  &:last-child {
    margin-bottom: 0;
  }

  .layer-group__visibility-toggle {
    margin-right: 12px;
  }
`;

const LayerLabel = PanelLabelBold.extend`
  color: ${props =>
    props.active ? props.theme.textColor : props.theme.labelColor};
`;
const LayerGroupSelector = ({layers, editableLayers, onChange, topLayers}) => (
  <StyledInteractionPanel className="map-style__layer-group__selector">
    <div className="layer-group__header">
      <PanelLabel>Map Layers</PanelLabel>
    </div>
    <PanelContent className="map-style__layer-group">
      {Object.keys(editableLayers).map(slug => (
        <StyledLayerGroupItem className="layer-group__select" key={slug}>
          <PanelLabelWrapper>
            <PanelHeaderAction
              className="layer-group__visibility-toggle"
              id={`${slug}-toggle`}
              tooltip={layers[slug] ? 'hide' : 'show'}
              onClick={() =>
                onChange({
                  visibleLayerGroups: {
                    ...layers,
                    [slug]: !layers[slug]
                  }
                })
              }
              IconComponent={layers[slug] ? EyeSeen : EyeUnseen}
              active={layers[slug]}
              flush
            />
            <LayerLabel active={layers[slug]}>{slug}</LayerLabel>
          </PanelLabelWrapper>
          <CenterFlexbox className="layer-group__bring-top">
            <PanelHeaderAction
              id={`${slug}-top`}
              tooltip="Move to top of data layers"
              disabled={!layers[slug]}
              IconComponent={Upload}
              active={topLayers[slug]}
              onClick={() =>
                onChange({
                  topLayerGroups: {
                    ...topLayers,
                    [slug]: !topLayers[slug]
                  }
                })
              }
            />
          </CenterFlexbox>
        </StyledLayerGroupItem>
      ))}
    </PanelContent>
  </StyledInteractionPanel>
);

const BuildingLayer = ({buildingLayer, onChange}) => (
  <StyledInteractionPanel className="map-style__building-layer">
    <StyledPanelHeader className="map-style__building-layer__header">
      <PanelHeaderContent>
        <PanelLabelWrapper>
          <PanelLabel>3D Buildings</PanelLabel>
          <InfoHelper
            id="building-info"
            description="3D building only visible when zoom in to an area of the map"
          />
        </PanelLabelWrapper>
      </PanelHeaderContent>
      <Switch
        checked={buildingLayer.isVisible}
        id={`3d-building-toggle`}
        label={''}
        onChange={() => onChange({isVisible: !buildingLayer.isVisible})}
        secondary
      />
    </StyledPanelHeader>
    {buildingLayer.isVisible ? (
      <StyledPanelContent className="map-style__building-layer__content">
        <SidePanelSection>
          <PanelLabel>Color</PanelLabel>
          <ColorSelector
            colorSets={[{
              selectedColor: buildingLayer.color,
              setColor: rgbValue => onChange({color: rgbValue})
            }]}
            inputTheme="secondary"
          />
        </SidePanelSection>
        <SidePanelSection>
          <VisConfigSlider
            {...LAYER_VIS_CONFIGS.opacity}
            layer={{config: {visConfig: buildingLayer}}}
            inputTheme="secondary"
            onChange={onChange}
          />
        </SidePanelSection>
      </StyledPanelContent>
    ) : null}
  </StyledInteractionPanel>
);
