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
class TestReport < ActiveRecord::Base
  include JsonResource
  include IdentifiableResource
  include QuickValidation
  include Tableling::Model

  before_create{ set_identifier :api_id }

  belongs_to :runner, class_name: 'User'
  has_and_belongs_to_many :test_payloads

  validates :runner, presence: { unless: :quick_validation }

  tableling do

    default_view do

      field :api_id, as: :id
      field :created_at, as: :createdAt

      serialize_response do |res|
        res[:data].collect{ |p| p.to_builder.attributes! }
      end
    end
  end

  def to_builder options = {}
    Jbuilder.new do |json|
      json.id api_id
      json.runner runner.to_builder
      json.duration duration
      json.resultsCount results_count
      json.passedResultsCount passed_results_count
      json.inactiveResultsCount inactive_results_count
      json.inactivePassedResultsCount inactive_passed_results_count
      json.createdAt created_at.iso8601(3)
    end
  end

  %w(duration results_count passed_results_count inactive_results_count inactive_passed_results_count).each do |method|
    define_method method do
      sum_payload_values method
    end
  end

  private

  def sum_payload_values method
    test_payloads.inject(0){ |memo,payload| memo + payload.send(method) }
  end
end