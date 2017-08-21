
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { createStore, bindActionCreators } from 'redux'
import FontAwesome from 'react-fontawesome'
import LazyLoad from 'react-lazyload'

import * as helpers from '../helpers'
import * as uiActions from '../services/ui/actions'

class Thumbnail extends React.Component{

	constructor(props) {
		super(props);
	}
/*
	// TODO: ascertain whether this is improving or hindering performance
	// The UI appears to work perfectly fine without this
	shouldComponentUpdate(nextProps, nextState){

		// no images at all, and we already know it
		if (!nextProps.image && !this.props.image && !nextProps.images && !this.props.images) return false

		// image changed
		if (!this.props.image && nextProps.image) return true
		if (this.props.image && nextProps.image) return true
		if (this.props.image != nextProps.image) return true

		// images array changed
		if (this.props.images === undefined && nextProps.images ) return true
		if (this.props.images && nextProps.images === undefined) return true
		if (this.props.images && !nextProps.images || this.props.images.length != nextProps.images.length ) return true

		// image item changed	
		var size = 'medium'
		var images = helpers.sizedImages( nextProps.images )
		if (this.props.size ) size = this.props.size
		if (this.props.images[size] != images[size]) return true

		return false
	}
	*/

	mapImageSizes( props = this.props ){

		// no images
		if( !this.props.image && !this.props.images ){
			return require('../../assets/no-image.svg')

		// single image
		}else if( this.props.image ){
			return this.props.image

		// multiple images
		}else if( this.props.images && this.props.images.length > 0 ){
			var images = helpers.sizedImages( this.props.images )
			var size = 'medium'
			if( this.props.size ) size = this.props.size
			return images[size]
		}
	}

	zoom(e, image){
		e.preventDefault()
		this.props.uiActions.openModal('image_zoom', {url: image} )
	}

	render(){
		var image = this.mapImageSizes()
		var class_name = 'thumbnail '
		if( this.props.size ) class_name += ' '+this.props.size
		if( this.props.circle ) class_name += ' circle'
		if( this.props.className ) class_name += ' '+this.props.className
		
		var zoom_icon = null
		if (this.props.canZoom){
			zoom_icon = <span className="zoom" onClick={e => this.zoom(e,image)}><FontAwesome name="search" /></span>
		}

		/*
		// It's a great idea, but interferes with huge lists (like Albums library)
		<LazyLoad height={600} placeholder={<div className="image"></div>}>
			<div className="image loaded" style={{backgroundImage: 'url("'+image+'")'}}></div>
		</LazyLoad>
		*/

		return (
			<div className={class_name}>
				<div className="image loaded" style={{backgroundImage: 'url("'+image+'")'}}></div>
				{zoom_icon}
			</div>
		);
	}
}

const mapStateToProps = (state, ownProps) => {
	return {}
}

const mapDispatchToProps = (dispatch) => {
	return {
		uiActions: bindActionCreators(uiActions, dispatch)
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Thumbnail)