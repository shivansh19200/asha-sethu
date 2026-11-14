import React from 'react'

export default function Tile({ title, subtitle }) {
  return (
    <button className="tile" type="button" aria-label={`${title} tile`}>
      <div className="tile-title">{title}</div>
      {subtitle && <div className="tile-sub">{subtitle}</div>}
    </button>
  )
}
