
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import FontAwesome from 'react-fontawesome'
import * as helpers from '../helpers'

import TrackList from '../components/TrackList'
import Thumbnail from '../components/Thumbnail'
import Dater from '../components/Dater'
import ConfirmationButton from '../components/ConfirmationButton'
import LazyLoadListener from '../components/LazyLoadListener'

import * as uiActions from '../services/ui/actions'
import * as mopidyActions from '../services/mopidy/actions'
import * as spotifyActions from '../services/spotify/actions'

class Playlist extends React.Component{

	constructor(props) {
		super(props);
	}

	componentDidMount(){
		this.loadPlaylist();
	}

	componentWillReceiveProps( nextProps ){
		if( nextProps.params.uri != this.props.params.uri ){
			this.loadPlaylist( nextProps )
		}else if( !this.props.mopidy_connected && nextProps.mopidy_connected ){
			if( helpers.uriSource( this.props.params.uri ) == 'm3u' ){
				this.loadPlaylist( nextProps )
			}
		}
	}

	loadPlaylist( props = this.props ){
		switch( helpers.uriSource( props.params.uri ) ){

			case 'spotify':
				this.props.spotifyActions.getPlaylist( props.params.uri );
				break

			case 'm3u':
				if( props.mopidy_connected ) this.props.mopidyActions.getPlaylist( props.params.uri );
				break

		}
	}

	loadMore(){
		if( !this.props.playlist.tracks_more ) return
		this.props.spotifyActions.getURL( this.props.playlist.tracks_more, 'SPOTIFY_PLAYLIST_LOADED_MORE' );
	}

	play(){
		this.props.mopidyActions.playTracks([this.props.params.uri])
	}

	follow(){
		this.props.spotifyActions.toggleFollowingPlaylist( this.props.params.uri, 'PUT' )
	}

	unfollow(){
		this.props.spotifyActions.toggleFollowingPlaylist( this.props.params.uri, 'DELETE' )
	}

	delete(){
		alert('Delete me')
	}

	removeTracks( track_indexes ){
		this.props.uiActions.removeTracksFromPlaylist( track_indexes )
	}

	renderFollowOrDeleteButton(){
		if( !this.props.spotify_authorized ) return null

		switch( helpers.uriSource( this.props.params.uri ) ){

			case 'm3u':
				return <ConfirmationButton className="large tertiary" content="Delete" confirmingContent="Confirm" onConfirm={ e => this.delete() } />
				break

			case 'spotify':			
				if( this.props.playlist.owner && this.props.playlist.owner.id == this.props.spotify_userid ){
					return <ConfirmationButton className="large tertiary" content="Delete" confirmingContent="Are you sure?" onConfirm={ e => this.delete() } />
				}else if( this.props.playlist.following ){
					return <button className="large tertiary" onClick={ e => this.unfollow() }>Unfollow</button>
				}else{
					return <button className="large tertiary" onClick={ e => this.follow() }>Follow</button>
				}
				break

		}
	}

	render(){
		if( !this.props.playlist || !this.props.playlist.name ) return null;
		var scheme = helpers.uriSource( this.props.params.uri );

		return (
			<div className="view playlist-view">
				<div className="intro">

					<Thumbnail size="large" images={ this.props.playlist.images } />

					<div className="actions">
						<button className="large primary" onClick={ e => this.play() }>Play</button>
						{ this.renderFollowOrDeleteButton() }
					</div>

					<ul className="details">
						<li>{ this.props.playlist.tracks_total } tracks, <Dater type="total-time" data={this.props.playlist.tracks} /></li>
						{ this.props.playlist.last_modified ? <li>Updated <Dater type="ago" data={this.props.playlist.last_modified} /> ago</li> : null }
						{ scheme == 'spotify' ? <li><FontAwesome name="spotify" /> Spotify playlist</li> : null }
						{ scheme == 'm3u' ? <li><FontAwesome name="folder" /> Local playlist</li> : null }
					</ul>

				</div>
				<div className="main">

					<div className="title">
						<h1>{ this.props.playlist.name }</h1>
						{ this.props.playlist.description ? <h3 className="grey-text" dangerouslySetInnerHTML={{__html: this.props.playlist.description}}></h3> : null }
					</div>

					<section className="list-wrapper">
						{ this.props.playlist.tracks ? <TrackList context="editable-playlist" tracks={ this.props.playlist.tracks } removeTracks={ track_indexes => this.removeTracks(track_indexes) } /> : null }
						<LazyLoadListener loadMore={ () => this.loadMore() }/>
					</section>
					
				</div>
			</div>
		)
	}
}


/**
 * Export our component
 *
 * We also integrate our global store, using connect()
 **/

const mapStateToProps = (state, ownProps) => {
	return {
		playlist: state.ui.playlist,
		mopidy_connected: state.mopidy.connected,
		spotify_authorized: state.spotify.authorized,
		spotify_userid: state.spotify.me.id
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		uiActions: bindActionCreators(uiActions, dispatch),
		mopidyActions: bindActionCreators(mopidyActions, dispatch),
		spotifyActions: bindActionCreators(spotifyActions, dispatch)
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Playlist)