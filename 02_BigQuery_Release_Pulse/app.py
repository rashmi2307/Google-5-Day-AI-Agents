import xml.etree.ElementTree as ET
import requests
from bs4 import BeautifulSoup
from flask import Flask, jsonify, render_template, request
import re
import html

app = Flask(__name__)

FEED_URL = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"

def fetch_and_parse_notes():
    try:
        response = requests.get(FEED_URL, timeout=10)
        response.raise_for_status()
    except Exception as e:
        return {"error": f"Failed to fetch release notes: {str(e)}"}, 500

    try:
        # Use ET to parse the main Atom feed XML structure
        root = ET.fromstring(response.content)
        # Atom feed namespace
        ns = {'atom': 'http://www.w3.org/2005/Atom'}
        
        updates = []
        item_id_counter = 1
        
        for entry in root.findall('atom:entry', ns):
            title_el = entry.find('atom:title', ns)
            date_str = title_el.text.strip() if title_el is not None else 'Unknown Date'
            
            link_el = entry.find("atom:link[@rel='alternate']", ns)
            link_href = link_el.attrib.get('href', '') if link_el is not None else ''
            
            content_el = entry.find('atom:content', ns)
            if content_el is None or not content_el.text:
                continue
            
            # The content is HTML inside CDATA
            content_html = content_el.text
            soup = BeautifulSoup(content_html, 'html.parser')
            
            # We want to split the content into individual updates by their <h3> tags
            # (which denote "Feature", "Change", "Breaking", etc.)
            current_type = None
            current_elements = []
            
            # Helper to create an update dict
            def add_update(update_type, elements):
                nonlocal item_id_counter
                if not elements:
                    return
                
                # Combine element HTML
                html_str = "".join(str(el) for el in elements)
                
                # Make all links open in a new tab and have rel="noopener noreferrer"
                sub_soup = BeautifulSoup(html_str, 'html.parser')
                for a in sub_soup.find_all('a'):
                    a['target'] = '_blank'
                    a['rel'] = 'noopener noreferrer'
                    # Add standard styles to the anchor tags
                    a['class'] = a.get('class', []) + ['release-link']
                
                modified_html = str(sub_soup)
                
                # Get clean plain text for sharing / tweeting
                text_content = sub_soup.get_text().strip()
                # Clean up multiple spaces/newlines
                text_content = re.sub(r'\s+', ' ', text_content)
                
                # Ensure type is styled nicely
                clean_type = update_type.strip().capitalize()
                
                updates.append({
                    'id': f"note_{item_id_counter}",
                    'date': date_str,
                    'type': clean_type,
                    'content_html': modified_html,
                    'content_text': text_content,
                    'link': link_href
                })
                item_id_counter += 1

            for child in soup.children:
                # NavigableString can occur, check if child is a tag
                if child.name == 'h3':
                    # Save the previous update
                    if current_type:
                        add_update(current_type, current_elements)
                        current_elements = []
                    current_type = child.get_text().strip()
                elif child.name:
                    current_elements.append(child)
                    
            # Add the final update in this entry
            if current_type and current_elements:
                add_update(current_type, current_elements)
            elif not current_type and current_elements:
                # If there are no h3 tags at all, capture everything as 'Update'
                add_update('Update', current_elements)
                
        return {"updates": updates}, 200
        
    except Exception as e:
        return {"error": f"Failed to parse release notes: {str(e)}"}, 500

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/release-notes')
def get_release_notes():
    data, status_code = fetch_and_parse_notes()
    return jsonify(data), status_code

if __name__ == '__main__':
    app.run(debug=True, port=5000)
