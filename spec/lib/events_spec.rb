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
require 'spec_helper'

describe "ROXCenter::Application.events" do

  subject{ ROXCenter::Application }

  it "should respond to #events", rox: { key: 'dc7ac63cdb50' } do
    expect(subject).to respond_to(:events)
  end

  it "should listen to and fire events", rox: { key: '618e880b4142' } do
    result = []
    subject.events.on(:fubar) do |*args|
      result.concat args
    end
    subject.events.fire :fubar, 'a'
    subject.events.fire :fubar, 'b', 'c'
    expect(result).to eq([ 'a', 'b', 'c' ])
  end
end
