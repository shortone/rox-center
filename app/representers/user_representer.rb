# Copyright (c) 2012-2014 Lotaris SA
#
# This file is part of ROX Center.
#
# ROX Center is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# ROX Center is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with ROX Center.  If not, see <http://www.gnu.org/licenses/>.
class UserRepresenter < BaseRepresenter

  representation do |user,*args|
    options = args.last.kind_of?(Hash) ? args.pop : {}

    link 'self', api_uri(:user, id: user.id)
    link 'alternate', uri(:user, id: user), type: media_type(:html)
    link 'edit', uri(:edit_user, id: user), type: media_type(:html)

    property :name, user.name
    property :email, user.email if user.email
    property :createdAt, user.created_at.to_ms
    property :technical, true if user.technical?

    if options[:detailed]
      property :active, user.active
      property :deletable, user.deletable?
    end
  end
end
